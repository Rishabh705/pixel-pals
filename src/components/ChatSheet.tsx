import { Suspense, useState } from "react"
import {Await} from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAppSelector } from "@/rtk/hooks";
import { ChatData, GroupChatData, IndividualChatData, User, SocketMessage } from "@/utils/types"
import { Skeleton } from "@/components/ui/skeleton";
import NewChat from "@/components/NewChat";
import ChatCard from "@/components/ChatCard";
import { cn } from "@/lib/utils";


export default function ChatSheet({error, data, className}:{error:any; data:any; className?:string}) {

    const [searchText, setSearchText] = useState<string>("");
    const username: (string | null) = useAppSelector((state) => state.auth.username)
    const userId: string | null = useAppSelector((state) => state.auth.userId);
    const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
    const results = data.data

    const renderCards = ({ data }: { data: ChatData }) => {

        const uniqueSocketMessages:Map<string, SocketMessage> = new Map();

        for(const msg of socketMessages){
            //populate
            uniqueSocketMessages.set(msg.chatId, msg);
        }
        
        const filteredIndiChats:IndividualChatData[] = data.individualChats.filter((chat:IndividualChatData)=>{
            return !uniqueSocketMessages.has(chat._id)
        })||[];

        const filteredGropChats:GroupChatData[] = data.groupChats.filter((chat:GroupChatData)=>{
            return !uniqueSocketMessages.has(chat._id)
        }) || []

        const filteredSocketChats:SocketMessage[] = Array.from(uniqueSocketMessages.values())

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
                    key={msg._id}
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
                        key={chat._id}
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
                        key={chat._id}
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
                        <p className="text-muted-foreground">No chats found</p>
                    </div>
                )}
            </>
        );
    }
    return (
        <div className={cn(className,"lg:flex lg:flex-col lg:w-1/3 lg:min-w-72 lg:max-w-96 bg-secondary lg:border-r-2")}>
            <section className="flex items-center justify-between border-b-2">
                <div className="flex gap-4 justify-start py-5 px-2 lg:px-6 items-center ">
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
            <section className="pt-5 pb-2 lg:px-4 flex items-center">
                <span className="h-full flex items-center py-2.5 pl-2.5 rounded-l-full bg-background">
                    <CiSearch size={20} color="#858687" />
                </span>
                <Input className="rounded-r-full border-none active:border-none bg-background" placeholder="Search a text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </section>
            <section className="flex flex-col gap-2 overflow-y-scroll scrollbar lg:py-2 lg:px-4 g data">
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
        </div>)
}
