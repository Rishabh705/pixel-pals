import { Suspense, useState } from "react"
import { Await } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAppSelector } from "@/rtk/hooks";
import { ChatData, SocketMessage } from "@/utils/types"
import { Skeleton } from "@/components/ui/skeleton";
import NewChat from "@/components/NewChat";
import ChatCard from "@/components/ChatCard";
import { cn } from "@/lib/utils";


export default function ChatSheet({ error, data, className }: { error: any; data: any; className?: string }) {
    const [searchText, setSearchText] = useState<string>("");
    const username: (string | null) = useAppSelector((state) => state.auth.username);
    const email: (string | null) = useAppSelector((state) => state.auth.email);
    const userId: string | null = useAppSelector((state) => state.auth.userId);
    const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
    const results = data.data;

    const renderCards = ({ data }: { data: ChatData }) => {
        const socketMessagesMap = new Map();
        for (const msg of socketMessages) {
            socketMessagesMap.set(msg.chat_id, msg);
        }

        // Update individual chats with socket messages
        const updatedIndividualChats = data.individualChats.map((chat) => {
            const socketMessage = socketMessagesMap.get(chat.chat_id);
            if (socketMessage) {
                return {
                    ...chat,
                    lastmessage: {
                        _id: socketMessage._id,
                        message: socketMessage.message,
                        sender: socketMessage.sender,
                        timestamp: socketMessage.timestamp,
                    },
                };
            }
            return chat;
        });

        // Update group chats with socket messages
        const updatedGroupChats = data.groupChats.map((chat) => {
            const socketMessage = socketMessagesMap.get(chat.chat_id);
            if (socketMessage) {
                return {
                    ...chat,
                    lastmessage: {
                        _id: socketMessage._id,
                        message: socketMessage.message,
                        sender: socketMessage.sender,
                        timestamp: socketMessage.timestamp,
                    },
                };
            }
            return chat;
        });

        // Filter and map individual chat cards
        const individualChatCards = updatedIndividualChats
            .filter((chat) => {
                const otherParticipant = chat.participant1._id === userId ? chat.participant2 : chat.participant1;
                return otherParticipant.username.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((chat) => {
                const otherParticipant = chat.participant1._id === userId ? chat.participant2 : chat.participant1;
                const sender = chat.lastmessage?.sender?.username || "";
                const lastMessage = chat.lastmessage?.message || "No messages yet :";
                const subtitle = sender.toLowerCase() === username?.toLowerCase() ? `You: ${lastMessage}` : `${sender}: ${lastMessage}`;

                return (
                    <ChatCard
                        key={chat.chat_id}
                        chatId={chat.chat_id}
                        link={`${chat.chat_id}?re=${otherParticipant?._id}&&name=${otherParticipant?.username}`}
                        avatarSrc="https://github.com/shadcn.png"
                        fallbackText={otherParticipant?.username || ""}
                        title={otherParticipant?.username || ""}
                        subtitle={subtitle}
                    />
                );
            });

        // Filter and map group chat cards
        const groupChatCards = updatedGroupChats
            .filter((chat) => chat.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((chat) => {
                const sender = chat.lastmessage?.sender?.username || "";
                const lastMessage = chat.lastmessage?.message || "No messages yet :";
                const subtitle =
                    sender.toLowerCase() === username?.toLowerCase() ? `You: ${lastMessage}` : `${sender}: ${lastMessage}`;

                return (
                    <ChatCard
                        key={chat.chat_id}
                        chatId={chat.chat_id}
                        link={`${chat.chat_id}?name=${chat.name}`}
                        avatarSrc="https://github.com/shadcn.png"
                        fallbackText={chat.name}
                        title={chat.name}
                        subtitle={subtitle}
                    />
                );
            });

        const allCards = [...individualChatCards, ...groupChatCards];

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
        <div className={cn(className, "lg:flex lg:flex-col lg:w-1/3 lg:min-w-72 lg:max-w-96 bg-secondary lg:border-r-2")}>
            <section className="flex items-center justify-between border-b-2">
                <div className="flex gap-4 justify-start py-5 px-2 lg:px-6 items-center ">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-md font-medium text-card-foreground">{username}</h1>
                        <p className="text-sm font-medium text-muted-foreground">{email}</p>
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
        </div>
    )
}
