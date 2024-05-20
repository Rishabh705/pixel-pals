import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuPaperclip, LuMic } from "react-icons/lu";
import { Input } from "./ui/input";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";

export default function Chats() {
  const myChats: {
    id: number;
    user: string;
    sent: boolean;
    message: string;
    timestamp: string;
  }[] = [
      {
        id: 1,
        user: 'Alice',
        sent: true,
        message: 'Hey, how are you doing?',
        timestamp: '2024-05-20T14:28:00Z'
      },
      {
        id: 2,
        user: 'Bob',
        sent: false,
        message: 'I\'m good, thanks! How about you?',
        timestamp: '2024-05-20T14:30:00Z'
      },
      {
        id: 3,
        user: 'Alice',
        sent: true,
        message: 'I\'m great, just been busy with work.',
        timestamp: '2024-05-20T14:32:00Z'
      },
      {
        id: 4,
        user: 'Bob',
        sent: false,
        message: 'Same here. Looking forward to the weekend.',
        timestamp: '2024-05-20T14:34:00Z'
      },
      {
        id: 5,
        user: 'Alice',
        sent: true,
        message: 'Do you have any plans for the weekend?',
        timestamp: '2024-05-20T14:36:00Z'
      },
      {
        id: 6,
        user: 'Bob',
        sent: false,
        message: 'Not sure yet, might go hiking if the weather is nice.',
        timestamp: '2024-05-20T14:38:00Z'
      },
      {
        id: 7,
        user: 'Alice',
        sent: true,
        message: 'That sounds fun! I might join you if you don\'t mind.',
        timestamp: '2024-05-20T14:40:00Z'
      },
      {
        id: 8,
        user: 'Bob',
        sent: false,
        message: 'Of course! The more, the merrier.',
        timestamp: '2024-05-20T14:42:00Z'
      }
    ];

  const messages = myChats.map((chat) => (
    <div key={chat.id} className={`flex gap-4 ${chat.sent ? 'justify-end':'justify-start'}`}>
        {
          chat.sent ? 
             <SentMsg text={chat.message} time={chat.timestamp} user={chat.user} />
          :
            <RecievedMsg text={chat.message} time={chat.timestamp} user={chat.user}/>
        }
    </div>
  ));

  return (
    <div className='flex-1 flex flex-col'>
      <section className="flex gap-4 justify-start py-5 px-4 md:px-6 lg:px-8 items-center border-b-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-md font-semibold text-card-foreground">RAZOR</h1>
          <p className="text-md font-medium text-card-foreground flex items-center">
            123 Members  200 Online
          </p>
        </div>
      </section>
      <section className="bg-slate-100 flex-1 p-3 space-y-8 overflow-y-scroll scrollbar">
        {/* Chats here */}
        {messages}
      </section>
      <section className="flex gap-2 justify-start py-5 px-4 md:px-6 lg:px-8 items-center">
        <span className="p-2 bg-secondary rounded-full">
          <MdOutlineEmojiEmotions size={23} />
        </span>
        <span className="p-2 bg-secondary rounded-full">
          <LuPaperclip size={20} />
        </span>
        <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" />
        <span className="p-2 bg-primary rounded-full">
          <LuMic size={20} color="aliceblue" />
        </span>
      </section>
    </div>
  )
}
