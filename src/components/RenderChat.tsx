import { Suspense, useEffect, useRef } from "react";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { Await } from "react-router-dom";
import { DetailedIndividualChat, DetailedGroupChat, Message, SocketMessage } from "@/utils/types";
import { socket } from "@/lib/socket";
import { clear } from "@/rtk/slices/socketMsgSlice";
import { Skeleton } from "./ui/skeleton";

export default function RenderChat({ results, chatId }: { results?: any, chatId: string }) {
  const currentUser: string | null = useAppSelector((state) => state.auth.userId);
  const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

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

  const renderChats = ({ data }: { data: DetailedIndividualChat | DetailedGroupChat }) => {
    const socketMessagesMap: Map<string, SocketMessage> = new Map<string, SocketMessage>();
    for (const msg of socketMessages) {
      socketMessagesMap.set(msg._id, msg);
    }

    const filteredChatMessages: Message[] = data?.messages.filter((msg) => msg._id && !socketMessagesMap.has(msg._id)).map((msg) => {
      return msg
    });
    const filteredSocketMessages: SocketMessage[] = socketMessagesMap.size > 0
      ? [...socketMessagesMap.values()].filter((msg) => msg.chat_id === chatId).map(msg => {    // ensure that only messages from the current chat are displayed 
        return msg
      })
      : [];

    const allMessages: (Message | SocketMessage)[] = [...filteredChatMessages, ...filteredSocketMessages].sort((a, b) => {
      const d1: Date = new Date(a.created_at);
      const d2: Date = new Date(b.created_at);
      return d1.getTime() - d2.getTime();
    });

    const messages: JSX.Element[] = allMessages?.map((message) => (
      <div key={message._id} className={`flex gap-4 ${currentUser === message.sender?._id ? 'justify-end' : 'justify-start'}`}>
        {currentUser === message.sender?._id ? (
          <SentMsg cipher={message.message} time={message.created_at}/>
        ) : (
          <RecievedMsg cipher={message.message} time={message.created_at} participant={message.sender?.username}/>
        )}
      </div>
    )) || [];

    return (
      <>
        {messages.length > 0 ? (
          messages
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center h-96">
            <p className="text-muted-foreground text-lg">Send the First Message</p>
          </div>
        )}
      </>
    );
  };

  return (
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
  );
}
