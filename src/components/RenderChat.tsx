import { Suspense, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuPaperclip, LuMic } from "react-icons/lu";
import { Input } from "./ui/input";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { Await, Form } from "react-router-dom";
import { DetailedChatData, Message, SocketMessage } from "@/utils/types";
import { socket } from "@/lib/socket"
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";

export default function RenderChat({results, method, chatId}:{results?:any, method:any, chatId:string}) {
    const scrollRef = useRef(null)
    const currentUser: (string | null) = useAppSelector((state) => state.auth.userId)
    const dispatch = useAppDispatch()
    const socketMessages: SocketMessage[] = useAppSelector((state) => state.socketMsgs)
  
    useEffect(() => {
      const handleMessage = (data: SocketMessage) => {
        dispatch(setSocketMsg(data))
      };
      const elem = document.querySelector('.data')
      if (elem) {
        elem.scrollTop = elem.scrollHeight
      }
  
      socket.on('receive-message', handleMessage);
  
      // Cleanup on unmount
      return () => {
        socket.off('receive-message', handleMessage);
      };
    }, [socket, setSocketMsg, socketMessages])
  
    const renderCards = ({ data }: { data: DetailedChatData }) => {
      const socketMessageIds:Set<string> = new Set(socketMessages.map((msg) => msg._id));
  
      // Filter out messages from data.chat.messages that have the same ID as socketMessages
      const filteredChatMessages:Message[] = data?.chat?.messages.filter(
        (msg:Message) => !socketMessageIds.has(msg._id)
      )||[];

      const filteredSocketMessages: SocketMessage[] = socketMessages.filter((msg:SocketMessage) => msg.chatId === chatId);
    
      // Combine filtered chat messages with socket messages
      const allMessages:(Message|SocketMessage)[] = [...filteredChatMessages, ...filteredSocketMessages];
    
      const messages: JSX.Element[] = allMessages.map((message: (Message | SocketMessage)) => (
        <div key={message._id} className={`flex gap-4 ${currentUser === message.sender._id ? 'justify-end' : 'justify-start'}`}>
          {currentUser === message.sender._id ? (
            <SentMsg text={message.message} time={message.createdAt} participant={message.sender.username} />
          ) : (
            <RecievedMsg text={message.message} time={message.createdAt} participant={message.sender.username} />
          )}
        </div>
      ))
  
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
        <section className="flex gap-4 justify-start py-5 px-4 md:px-6 lg:px-8 items-center border-b-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-md font-semibold text-card-foreground">RAZOR</h1>
            <p className="text-md font-medium text-card-foreground flex items-center">
              123 Members 🞄 200 Online
            </p>
          </div>
        </section>
        <section className="bg-slate-100 flex-1 p-3 space-y-8 overflow-y-scroll scrollbar data" ref={scrollRef}>
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
            <Await resolve={results.data}>
              {renderCards}
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
          <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" name="message" />
          <span className="p-2 bg-primary rounded-full">
            <LuMic size={20} color="aliceblue" />
          </span>
        </Form>
      </div>
    )
  }