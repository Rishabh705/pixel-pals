import React, { Suspense } from "react";
import { Outlet, defer, useLoaderData, Await, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError, TbHexagonPlusFilled } from "react-icons/tb";
import { store } from "@/rtk/store";
import '../styles/chatlayout.css'
import { getChats } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";
import { ChatData, GroupChatData, IndividualChatData, User } from "@/lib/types";
import { useAppSelector } from "@/rtk/hooks";

export async function loader({ request }: { request: Request }) {
    await requireAuth(request)
    const userId: (string | null) = store.getState().auth.userId
    const token: (string | null) = store.getState().auth.token

    if (userId === null || token === null) return { data: [] }

    const data = getChats(userId, token)
    return defer({ data })

}

export default function ChatLayout() {
    const data: any = useLoaderData()
    const results = data.data
    const [searchText, setSearchText] = React.useState<string>("")
    // const [newChat, setNewChat] = React.useState<boolean>(false)

    const renderCards = ({ data }:{data: ChatData}) => {
            
        const userId: string | null = useAppSelector((state) => state.auth.userId);
        
        const individualChatCards: JSX.Element[] = data.individualChats.map((chat: IndividualChatData) => {
                
                const displayAvatar: string = "https://github.com/shadcn.png";
                const otherParticipant: User | undefined = chat.chat.participants?.find(
                    (participant: User) => participant._id !== userId
                );
                const sender:string = chat.chat.lastMessage.sender.username;
                const lastMessage:string = chat.chat.lastMessage.message;

                return (
                    <Link
                        to={`${chat._id}?re=${otherParticipant?._id}`}
                        key={chat._id}
                        className="py-4 px-4 md:px-6 lg:px-8 border-b-2 border-r-2 bg-card flex items-center gap-4 hover:bg-secondary hover:cursor-pointer"
                    >
                        <Avatar>
                            <AvatarImage src={displayAvatar} />
                            <AvatarFallback>{otherParticipant?.username}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-md font-semibold text-card-foreground">
                                {otherParticipant?.username}
                            </h2>
                            <p className="text-sm font-medium text-card-foreground">
                                {sender}: {lastMessage}
                            </p>
                        </div>
                    </Link>
                );
            }
        );

        const groupChatCards: JSX.Element[] = data.groupChats.map((chat: GroupChatData) => {
            
            const displayAvatar: string = "https://github.com/shadcn.png";
            const sender:string = chat.chat.lastMessage.sender.username;
            const lastMessage:string = chat.chat.lastMessage.message;

            return (
                <Link
                    to={`${chat._id}`}
                    key={chat._id}
                    className="py-4 px-4 md:px-6 lg:px-8 border-b-2 border-r-2 bg-card flex items-center gap-4 hover:bg-secondary hover:cursor-pointer"
                >
                    <Avatar>
                        <AvatarImage src={displayAvatar} />
                        <AvatarFallback>{chat.chat.name}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-md font-semibold text-card-foreground">
                            {chat.chat.name}
                        </h2>
                        <p className="text-sm font-medium text-card-foreground">
                            {sender}: {lastMessage}
                        </p>
                    </div>
                </Link>
            );
        });

        const allCards = [...individualChatCards, ...groupChatCards];

        return (
            <>
                {allCards.length > 0 ? (
                    allCards
                ) : (
                    <div className="flex flex-col gap-2 justify-center items-center h-96">
                        <TbFaceIdError size={40} color="#858687" />
                        <p className="text-muted-foreground">No messages found</p>
                    </div>
                )}
            </>
        );
    }; return (
        <div className="flex h-screen border-b-2">
            <div className="flex flex-col w-1/4 min-w-72 max-w-96 relative">
                <section className="flex gap-4 justify-start py-5 px-4 md:px-6 lg:px-8 items-center border-r-2 border-b-2">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-md font-semibold text-card-foreground">RAZOR</h1>
                        <p className="text-md font-medium text-card-foreground">@47razor</p>
                    </div>
                </section>
                <section className="py-5 px-4 md:px-6 lg:px-8 flex items-center border-b-2 border-r-2">
                    <span className="h-full flex items-center pl-2 rounded-l-full bg-slate-100">
                        <CiSearch size={20} color="#858687" />
                    </span>
                    <Input className="rounded-r-full border-none active:border-none bg-slate-100" placeholder="Search a text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </section>
                <section className="flex flex-col overflow-y-scroll scrollbar">
                    <Suspense fallback={
                        <>
                            {
                                Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="py-4 px-4 md:px-6 lg:px-8  border-b-2 border-r-2 bg-card flex items-center gap-4 hover:bg-secondary hover:cursor-pointer">
                                        <span className="rounded-full p-3" />
                                        <div>
                                            <span className="text-md font-semibold text-card-foreground" />
                                            <span className="text-sm font-medium text-card-foreground" />
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
                <span className="bg-primary inline-block rounded-lg p-2 absolute right-5 bottom-5 hover:cursor-pointer">
                    <TbHexagonPlusFilled size={30} />
                </span>
            </div>
            <Outlet />
        </div>
    )
}
