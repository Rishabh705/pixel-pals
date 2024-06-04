import React, { Suspense, useEffect } from "react";
import { Outlet, defer, useLoaderData, Await, useActionData } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { store } from "@/rtk/store";
import '../styles/chatlayout.css'
import { addContact, getChats, getContacts } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";
import { ChatData, GroupChatData, IndividualChat, IndividualChatData, SocketMessage, User } from "@/utils/types";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import NewChat from "@/components/NewChat";
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import ChatCard from "@/components/ChatCard";
import { socket } from "@/lib/socket";
import { Socket } from "socket.io-client";

export async function loader({ request }: { request: Request }) {
    await requireAuth(request)
    const userId: (string | null) = store.getState().auth.userId
    const token: (string | null) = store.getState().auth.token

    if (userId === null || token === null) return { data: [] }

    const data = getChats(userId, token)
    const contacts = getContacts(userId, token)

    return defer({ data: data, contacts: contacts })

}

export async function action({ request }: { request: Request }) {

    try {
        const form: FormData = await request.formData()
        const contactName: string = form.get('contactName')?.toString() || ''
        const token: (string | null) = store.getState().auth.token

        if (!token) throw new Error("User not authenticated.")

        await addContact(token, contactName)
        return null
    } catch (error: any) {
        return error.message
    }

}

export default function ChatLayout() {
    const data: any = useLoaderData()
    const error: any = useActionData()
    const username: (string | null) = useAppSelector((state) => state.auth.username)
    const userId: string | null = useAppSelector((state) => state.auth.userId);
    const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
    const dispatch = useAppDispatch()
    const results = data.data

    const [searchText, setSearchText] = React.useState<string>("");

    useEffect(() => {
        const handleMessage = (data: SocketMessage) => {
            dispatch(setSocketMsg(data));
        };

        const elem = document.querySelector('.data');
        if (elem) {
            elem.scrollTop = elem.scrollHeight;
        }

        socket.on('receive-message', handleMessage);

        return () => {
            socket.off('receive-message', handleMessage);
        };
    }, [dispatch]);

    const renderCards = ({ data }: { data: ChatData }) => {

        const socketMessageChatIds:Set<string> = new Set(socketMessages.map((msg) => msg.chatId));
        
        const filteredIndiChats:IndividualChatData[] = data.individualChats.filter((chat:IndividualChatData)=>{
            return !socketMessageChatIds.has(chat._id)
        })||[];

        const filteredGropChats:GroupChatData[] = data.groupChats.filter((chat:GroupChatData)=>{
            return !socketMessageChatIds.has(chat._id)
        }) || []

        const filteredSocketChats:SocketMessage[] = socketMessages.filter((msg:SocketMessage)=>{
            return socketMessageChatIds.has(msg.chatId)
        })    
    

        const socketMessageCards: JSX.Element[] = filteredSocketChats
        .filter((msg:SocketMessage) => {
            const otherParticipant: User = msg.sender._id === userId ? msg.receiver : msg.sender;
            return otherParticipant?.username.toLowerCase().includes(searchText.toLowerCase());
        })
        .map((msg: SocketMessage) => {
            const sender: string = msg.sender?.username || "Unknown";
            const lastMessage: string = msg.message || "No messages yet";
            const subtitle = sender.toLowerCase() === username?.toLowerCase()
                ? `You: ${lastMessage}`
                : `${sender}: ${lastMessage}`;
            const otherParticipant: User = msg.sender._id === userId ? msg.receiver : msg.sender;

            return (
                <ChatCard
                    chatId={msg.chatId}
                    link={`${msg.chatId}?re=${otherParticipant?._id}&&name=${otherParticipant?.username}`}
                    avatarSrc="https://github.com/shadcn.png"
                    fallbackText={otherParticipant?.username || ""}
                    title={otherParticipant?.username || ""}
                    subtitle={subtitle}
                />
            )
        })

        const individualChatCards: JSX.Element[] = filteredIndiChats
            .filter((chat: IndividualChatData) => {
                const otherParticipant: User | undefined = chat.chat.participants?.find(
                    (participant: User) => participant._id !== userId
                );
                return otherParticipant?.username.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((chat: IndividualChatData) => {
                const otherParticipant: User | undefined = chat.chat.participants?.find(
                    (participant: User) => participant._id !== userId
                );
                const sender: string | undefined = chat.chat.lastMessage?.sender?.username;
                const lastMessage: string | undefined = chat.chat.lastMessage?.message;
                const subtitle = sender
                    ? sender.toLowerCase() === username?.toLowerCase()
                        ? `You: ${lastMessage}`
                        : `${sender}: ${lastMessage}`
                    : "No messages yet";

                return (
                    <ChatCard
                        chatId={chat._id}
                        link={`${chat._id}?re=${otherParticipant?._id}&&name=${otherParticipant?.username}`}
                        avatarSrc="https://github.com/shadcn.png"
                        fallbackText={otherParticipant?.username || ""}
                        title={otherParticipant?.username || ""}
                        subtitle={subtitle}
                    />
                );
            });

        const groupChatCards: JSX.Element[] = filteredGropChats
            .filter((chat: GroupChatData) => {
                return chat.chat.name.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((chat: GroupChatData) => {
                const sender: string | undefined = chat.chat.lastMessage?.sender?.username;
                const lastMessage: string | undefined = chat.chat.lastMessage?.message;
                const subtitle = sender
                    ? sender.toLowerCase() === username?.toLowerCase()
                        ? "You: " + lastMessage
                        : sender + ": " + lastMessage
                    : "No messages yet";

                return (
                    <ChatCard
                        chatId={chat._id}
                        link={`${chat._id}?name=${chat.chat.name}`}
                        avatarSrc="https://github.com/shadcn.png"
                        fallbackText={chat.chat.name}
                        title={chat.chat.name}
                        subtitle={subtitle}
                    />
                );
            });


        const allCards: JSX.Element[] = [...socketMessageCards, ...individualChatCards, ...groupChatCards];

        return (
            <>
                {allCards.length > 0 ? (
                    allCards
                ) : (
                    <div className="flex flex-col gap-2 justify-center items-center h-96 ">
                        <TbFaceIdError size={40} color="#858687" />
                        <p className="text-muted-foreground">No chats yet</p>
                    </div>
                )}
            </>
        );
    }
    return (
        <div className="flex h-screen border-b-2">
            <div className="hidden lg:flex lg:flex-col w-1/4 min-w-72 max-w-96 bg-secondary border-r-2 ">
                <section className="flex items-center justify-between border-b-2">
                    <div className="flex gap-4 justify-start py-5 px-2 md:px-4 lg:px-6 items-center ">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-md font-semibold text-card-foreground">{username}</h1>
                            <p className="text-md font-medium text-card-foreground">@47razor</p>
                        </div>
                    </div>
                    <div className="flex gap-4 px-3 items-center">
                        <NewChat contacts={data.contacts} error={error} className="hover:bg-background hover:rounded-full hover:cursor-pointer p-3" />
                        <span className="hover:bg-background hover:rounded-full hover:cursor-pointer p-3"><BsThreeDotsVertical size={22} /></span>
                    </div>
                </section>
                <section className="pt-5 pb-2 px-2 md:px-4 lg:px-6 flex items-center">
                    <span className="h-full flex items-center pl-2 rounded-l-full bg-background">
                        <CiSearch size={20} color="#858687" />
                    </span>
                    <Input className="rounded-r-full border-none active:border-none bg-background" placeholder="Search a text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </section>
                <section className="flex flex-col gap-2 overflow-y-scroll scrollbar p-2 data">
                    <Suspense fallback={
                        <>
                            {
                                Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="py-4 px-4 bg-card flex items-center gap-4 rounded-xl hover:bg-secondary hover:cursor-pointer">
                                        <Skeleton className="rounded-full p-5" />
                                        <div className="space-y-2">
                                            <Skeleton className="p-1 w-[200px]" />
                                            <Skeleton className="p-1 w-[250px]" />
                                            <Skeleton className="p-1 w-[150px]" />
                                        </div>
                                    </div>
                                ))
                            }
                        </>
                    }>
                        <Await resolve={results}>
                            {renderCards}
                        </Await>
                    </Suspense>
                </section>
            </div>
            <Outlet />
        </div>
    )
}
