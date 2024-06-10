import { Suspense, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuPaperclip, LuMic } from "react-icons/lu";
import { Input } from "./ui/input";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { Await, Form, useSearchParams } from "react-router-dom";
import { DetailedIndividualChat, DetailedGroupChat, Message, SocketMessage } from "@/utils/types";
import { socket } from "@/lib/socket";
import { clear } from "@/rtk/slices/socketMsgSlice";
import { Skeleton } from "./ui/skeleton";

export default function RenderChat({ results, method, chatId }: { results?: any, method: any, chatId: string }) {
  const scrollRef = useRef(null);
  const currentUser: (string | null) = useAppSelector((state) => state.auth.userId);
  const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const name: string = searchParams.get('name') || 'Title';

  useEffect(() => {
    const elem = document.querySelector('.data');
    if (elem) {
      elem.scrollTop = elem.scrollHeight;
    }

    dispatch(clear(1));

    socket.on('receive-message', () => { });

    // Cleanup on unmount
    return () => {
      socket.off('receive-message', () => { });
    };
  }, [chatId, dispatch]);
  
  const renderChats = ({data}:{data: DetailedIndividualChat | DetailedGroupChat}) => {
    
    const socketMessagesMap:Map<string, SocketMessage> = new Map();
    for (const msg of socketMessages) {
      socketMessagesMap.set(msg._id, msg);
    }

    const filteredChatMessages:Message[] = data.messages.filter((msg) => msg._id && !socketMessagesMap.has(msg._id));
    const filteredSocketMessages:SocketMessage[] = socketMessagesMap.size > 0 ? [...socketMessagesMap.values()] : [];

    const allMessages: (Message | SocketMessage)[] = [...filteredChatMessages, ...filteredSocketMessages].sort((a, b) => {
      const d1 = new Date(a.created_at);
      const d2 = new Date(b.created_at);
      return d1.getTime() - d2.getTime();
    });

    const messages: JSX.Element[] = allMessages.map((message) => (
      <div key={message._id} className={`flex gap-4 ${currentUser === message.sender?._id ? 'justify-end' : 'justify-start'}`}>
        {currentUser === message.sender?._id ? (
          <SentMsg text={message.message} time={message.created_at} participant={message.sender?.username} />
        ) : (
          <RecievedMsg text={message.message} time={message.created_at} participant={message.sender?.username} />
        )}
      </div>
    ));

    return (
      <>
        {messages.length > 0 ? (
          messages
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center h-96">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='flex-1 flex flex-col'>
      <section className="flex gap-4 justify-start py-5 px-4 pl-14 md:pl-14 md:px-6 lg:px-8 items-center border-b-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-card-foreground">{name}</h1>
          <p className="text-xs font-medium text-card-foreground flex items-center">
            typing...
          </p>
        </div>
      </section>
      <section className="bg-slate-100 flex-1 p-3 space-y-8 overflow-y-scroll scrollbar data" ref={scrollRef}>
        <Suspense fallback={
          <>
            {
              Array.from({ length: 20 }).map((_, index) => (
                <div key={index}>
                  {
                    index % 2 === 0 ? (
                      <div className="max-w-screen flex justify-end gap-4">
                        <Skeleton className="h-10 w-60 bg-slate-300 rounded-br-none rounded-l-xl rounded-tr-xl" />
                        <Skeleton className="h-10 w-10 bg-slate-300 rounded-full" />
                      </div>
                    ) : (
                      <div className="max-w-screen flex justify-start gap-4">
                        <Skeleton className="h-10 w-10 bg-slate-300 rounded-full" />
                        <Skeleton className="h-10 w-60 bg-slate-300 rounded-bl-none rounded-r-xl rounded-tl-xl" />
                      </div>
                    )
                  }
                </div>
              ))
            }
          </>
        }>
          <Await resolve={results}>
            {renderChats}
          </Await>
        </Suspense>
      </section>
      <Form className="flex gap-2 justify-start py-5 px-4 md:px-6 lg:px-8 items-center" method={method}>
        <span className="p-2 bg-secondary rounded-full">
          <MdOutlineEmojiEmotions size={23} />
        </span>
        <span className="p-2 bg-secondary rounded-full">
          <LuPaperclip size={20} />
        </span>
        <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" name="message" required />
        <span className="p-2 bg-primary rounded-full">
          <LuMic size={20} color="aliceblue" />
        </span>
      </Form>
    </div>
  )
}
