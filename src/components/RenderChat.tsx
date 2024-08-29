import { Suspense, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LuPaperclip, LuMic } from "react-icons/lu";
import { Input } from "./ui/input";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { Await, Form, useSearchParams, Link, useActionData } from "react-router-dom";
import { DetailedIndividualChat, DetailedGroupChat, Message, SocketMessage } from "@/utils/types";
import { socket } from "@/lib/socket";
import { clear } from "@/rtk/slices/socketMsgSlice";
import { Skeleton } from "./ui/skeleton";
import Emoji from "./Emoji";

export default function RenderChat({ results, method, chatId }: { results?: any, method: any, chatId: string }) {
  const currentUser: string | null = useAppSelector((state) => state.auth.userId);
  const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const name: string = searchParams.get('name') || 'Title';
  const actionData:any = useActionData();

  useEffect(() => {
    if (actionData?.success) {
      setText('');
    }
  }, [actionData]);

  useEffect(() => {
    socket.on('typing', (data: { chat_id: string, sender: string }) => {
      if (data.chat_id === chatId && data.sender !== currentUser) {
        setIsTyping(true);
      }
    });

    socket.on('stop-typing', (data: { chat_id: string, sender: string }) => {
      if (data.chat_id === chatId && data.sender !== currentUser) {
        setIsTyping(false);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, [chatId, currentUser]);


  useEffect(() => {
    const scrollToBottom = () => {
      messageContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    dispatch(clear(1));
    scrollToBottom();

    socket.on('receive-message', scrollToBottom);
    socket.on('send-message', scrollToBottom);


    // Cleanup on unmount
    return () => {
      socket.off('receive-message', scrollToBottom);
      socket.off('send-message', scrollToBottom);
    };
  }, [chatId, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', { sender: currentUser, chat_id: chatId });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { sender: currentUser, chat_id: chatId });
    }, 3000);
  };

  const renderChats = ({ data }: { data: DetailedIndividualChat | DetailedGroupChat }) => {
    const socketMessagesMap = new Map<string, SocketMessage>();
    for (const msg of socketMessages) {
      socketMessagesMap.set(msg._id, msg);
    }

    const filteredChatMessages: Message[] = data?.messages.filter((msg) => msg._id && !socketMessagesMap.has(msg._id));
    const filteredSocketMessages: SocketMessage[] = socketMessagesMap.size > 0 ? [...socketMessagesMap.values()] : [];
    const allMessages: (Message | SocketMessage)[] = [...filteredChatMessages, ...filteredSocketMessages].sort((a, b) => {
      const d1: Date = new Date(a.created_at);
      const d2: Date = new Date(b.created_at);
      return d1.getTime() - d2.getTime();
    });

    const messages: JSX.Element[] = allMessages?.map((message) => (
      <div key={message._id} className={`flex gap-4 ${currentUser === message.sender?._id ? 'justify-end' : 'justify-start'}`}>
        {currentUser === message.sender?._id ? (
          <SentMsg text={message.message} time={message.created_at} participant={message.sender?.username} />
        ) : (
          <RecievedMsg text={message.message} time={message.created_at} participant={message.sender?.username} />
        )}
      </div>
    )) || [];

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
      <div className="flex justify-between items-center px-4 md:px-6 lg:px-8">
        <section className="flex gap-4 justify-start py-5 px-4 pl-10 lg:pl-0 items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">{name}</h1>
            <p className="text-xs font-medium text-card-foreground flex items-center">
              {isTyping ? "typing..." : ""}
            </p>
          </div>
        </section>
        <Link to={`/board?chat_id=${chatId}`} className=" hover:bg-secondary rounded-full p-3 hover:cursor-pointer">
          <img src='/board.svg' className="h-6" />
        </Link>
      </div>

      <section className="bg-slate-100 flex-1 p-3 space-y-8 overflow-y-scroll scrollbar">
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
        <div ref={messageContainerRef} />
      </section>
      <Form className="flex gap-2 justify-start py-5 px-4 md:px-6 lg:px-8 items-center relative" method={method}>
        <Emoji setText={setText} />
        <span className="p-2 bg-secondary rounded-full">
          <LuPaperclip size={20} />
        </span>
        <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" name="message" required value={text} onChange={handleChange} />
        <span className="p-2 bg-primary rounded-full">
          <LuMic size={20} color="aliceblue" />
        </span>
      </Form>
    </div>
  );
}
