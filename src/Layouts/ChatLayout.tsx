import React, { Suspense } from "react";
import { Outlet, defer, useLoaderData, Await, Link, useActionData } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { store } from "@/rtk/store";
import '../styles/chatlayout.css'
import { addContact, getChats, getContacts } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";
import { ChatData, GroupChatData, IndividualChatData, User } from "@/utils/types";
import { useAppSelector } from "@/rtk/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import NewChat from "@/components/NewChat";

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

    const results = data.data

    const [searchText, setSearchText] = React.useState<string>("")

    const renderCards = ({ data }: { data: ChatData }) => {


        const individualChatCards: JSX.Element[] = data.individualChats
            .filter((chat: IndividualChatData) => {
                const otherParticipant: User | undefined = chat.chat.participants?.find(
                    (participant: User) => participant._id !== userId
                );
                return otherParticipant?.username.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((chat: IndividualChatData) => {

                const displayAvatar: string = "https://github.com/shadcn.png";
                const otherParticipant: User | undefined = chat.chat.participants?.find(
                    (participant: User) => participant._id !== userId
                );
                const sender: string = chat.chat.lastMessage?.sender?.username;
                const lastMessage: string = chat.chat.lastMessage?.message;

                return (
                    <div key={chat._id} className="space-y-2">
                        <Link
                            to={`${chat._id}?re=${otherParticipant?._id}&&name=${otherParticipant?.username}`}
                            className="py-4 md:px-2 lg:px-4 bg-secondary flex items-center gap-4 hover:bg-background hover:cursor-pointer rounded-xl"
                        >
                            <Avatar>
                                <AvatarImage src={displayAvatar} />
                                <AvatarFallback>{otherParticipant?.username}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-md font-semibold text-secondary-foreground">
                                    {otherParticipant?.username}
                                </h2>
                                <p className="text-sm font-medium text-secondary-foreground">
                                    {
                                        sender
                                            ? sender.toLowerCase() === username?.toLowerCase()
                                                ? `You: ${lastMessage}`
                                                : `${sender}: ${lastMessage}`
                                            : "No messages yet"
                                    }
                                </p>
                            </div>
                        </Link>
                        <Separator />
                    </div>
                );
            }
            );

        const groupChatCards: JSX.Element[] = data.groupChats
            .filter((chat: GroupChatData) => {
                return chat.chat.name.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((chat: GroupChatData) => {

                const displayAvatar: string = "https://github.com/shadcn.png";
                const sender: string = chat.chat.lastMessage.sender.username;
                const lastMessage: string = chat.chat.lastMessage.message;

                return (
                    <div key={chat._id} className="space-y-2">
                        <Link
                            to={`${chat._id}?name=${chat.chat.name}`}
                            className="py-4 md:px-2 lg:px-4 bg-secondary flex items-center gap-4 hover:bg-background hover:cursor-pointer hover:rounded-xl"
                        >
                            <Avatar>
                                <AvatarImage src={displayAvatar} />
                                <AvatarFallback>{chat.chat.name}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-md font-semibold text-secondary-foreground">
                                    {chat.chat.name}
                                </h2>
                                <p className="text-sm font-medium text-secondary-foreground">
                                    {
                                        sender
                                            ? sender.toLowerCase() === username?.toLowerCase()
                                                ? "You: " + lastMessage
                                                : sender + ": " + lastMessage
                                            : "No messages yet"
                                    }
                                </p>
                            </div>
                        </Link>
                        <Separator />
                    </div>
                );
            });

        const allCards: JSX.Element[] = [...individualChatCards, ...groupChatCards];

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
                <section className="flex flex-col gap-2 overflow-y-scroll scrollbar p-2">
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
