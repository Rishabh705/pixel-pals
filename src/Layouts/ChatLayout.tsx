import React from "react";
import { Outlet } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CiSearch } from "react-icons/ci";
import { TbFaceIdError } from "react-icons/tb";
import '../styles/chatlayout.css'

export default function ChatLayout() {
    const [searchText, setSearchText] = React.useState<string>("")
    const messages: {
        id: number;
        user: string;
        message: string;
    }[] = [
            { id: 1, user: "User1", message: "hi how are you" },
            { id: 2, user: "User2", message: "did you go to office" },
            { id: 3, user: "User1", message: "I am fine, thank you" },
            { id: 4, user: "User2", message: "Great to hear!" },
        ]
    const displayedMessages: {
        id: number;
        user: string;
        message: string;
    }[] = messages.filter((message) => message.message.toLowerCase().includes(searchText.toLowerCase()))

    const cards = displayedMessages.map((message) => (
        <div key={message.id} className="py-4 px-4 md:px-6 lg:px-8  border-b-2 border-r-2 bg-card flex items-center gap-4 hover:bg-secondary hover:cursor-pointer">
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-md font-semibold text-card-foreground">{message.user}</h2>
                <p className="text-sm font-medium text-card-foreground">{message.message}</p>
            </div>
        </div>
    ))

    return (
        <div className="flex h-screen border-b-2">
            <div className="flex flex-col w-1/4 min-w-72 max-w-96">
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
                    <Input className="rounded-r-full border-none active:border-none bg-slate-100" placeholder="Search message" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </section>
                <section className="flex flex-col overflow-y-scroll scrollbar">
                    {
                        cards.length > 0 ?
                            cards :
                            <div className="flex flex-col gap-2 justify-center items-center h-96">
                                <TbFaceIdError size={40} color="#858687" />
                                <p className="text-muted-foreground">No messages found</p>
                            </div>
                    }
                </section>
            </div>
            <Outlet />
        </div>
    )
}
