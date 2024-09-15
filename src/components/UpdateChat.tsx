import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getChat, sendMessage } from "@/lib/api";
import { defer, useActionData, useLoaderData, useParams, Form, Link, useSearchParams } from "react-router-dom";
import { store } from "@/rtk/store";
import { SocketMessage } from "@/utils/types";
import { requireAuth } from "@/lib/requireAuth";
import { socket } from "@/lib/socket"
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import RenderChat from "./RenderChat";
import Emoji from "./Emoji";
import { LuSendHorizonal } from "react-icons/lu";
import { Input } from "./ui/input";
import { useAppSelector } from '@/rtk/hooks';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export async function loader({ params, request }: { params: any, request: Request }) {
  // console.log('update chat loader');
  await requireAuth(request)
  const token: (string | null) = store.getState().auth.accessToken
  if (!token) return { data: [] }

  socket.emit('join-chat', params.id);

  const data: (Promise<any>) = getChat(params.id, token)
  return defer({ data })
}

export async function action({ request, params }: { request: Request, params: any }) {
  try {
    // console.log("update chat action");

    const form: FormData = await request.formData()
    const message: string = form.get('message')?.toString() || ''
    const token: (string | null) = store.getState().auth.accessToken
    const username: (string | null) = store.getState().auth.username
    const id: (string | null) = store.getState().auth.userId


    const chatId: string = params.id

    const url = new URL(request.url);
    const receiverName: string = url.searchParams.get("name") || '';
    const receiverId: string = url.searchParams.get("re") || '';


    if (!token || !username || !id) throw new Error('Unauthorized')

    const today: Date = new Date()

    const messageId: string = uuidv4();

    const data: SocketMessage = {
      _id: messageId,
      chat_id: chatId,
      message: message,
      sender: {
        _id: id,
        avatar: '',
        username: username,
      },
      receiver: {
        _id: receiverId,
        avatar: '',
        username: receiverName
      },
      created_at: today.toISOString()
    }
    store.dispatch(setSocketMsg(data))
    socket.emit('send-message', data)

    await sendMessage(message, token, messageId, chatId)

    return { message: "Message Sent.", success: true }

  } catch (error: any) {
    return { message: error.message, success: false }
  }

}

export default function UpdateChat() {
  const results: any = useLoaderData()
  const currentUser: string | null = useAppSelector((state) => state.auth.userId);
  const [text, setText] = React.useState<string>('');
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const actionData: any = useActionData();
  const [searchParams] = useSearchParams();
  const [isTyping, setIsTyping] = React.useState<boolean>(false);
  const name: string = searchParams.get('name') || 'Title';
  const [isOpen, setIsOpen] = React.useState(false);


  const { id } = useParams()

  if (!id) throw new Error('Chat not found')

  React.useEffect(() => {
    if (actionData?.success) {
      setText('');
    }
  }, [actionData]);

  React.useEffect(() => {
    socket.on('typing', (data: { chat_id: string, sender: string }) => {
      if (data.chat_id === id && data.sender !== currentUser) {
        setIsTyping(true);
      }
    });

    socket.on('stop-typing', (data: { chat_id: string, sender: string }) => {
      if (data.chat_id === id && data.sender !== currentUser) {
        setIsTyping(false);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, [id, currentUser]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', { sender: currentUser, chat_id: id });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { sender: currentUser, chat_id: id });
    }, 3000);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  }


  return (
    <div className='flex flex-col w-screen h-screen'>

      <div className="flex justify-between items-center px-4 md:px-6 lg:px-8">
        <section className="flex gap-4 justify-start py-5 px-4 pl-10 lg:pl-0 items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">{name}</h1>
            <p className="text-xs font-medium text-card-foreground flex items-center h-4">
              {isTyping ? "typing..." : ""}
            </p>
          </div>
        </section>
        <Link to={`/board?chat_id=${id}`} className="hover:bg-secondary rounded-full p-3 hover:cursor-pointer">
          <img src='/board.svg' className="h-6" />
        </Link>
      </div>

      <RenderChat results={results.data} chatId={id} />

      <Form className="flex gap-2 justify-start py-5 px-4 md:px-6 lg:px-8 items-center relative" method='PUT' onClick={(e)=>handleClick(e)}>
        <Emoji setText={setText} isOpen={isOpen} setIsOpen={setIsOpen}/>
        <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" name="message" required value={text} onChange={handleChange} />
        <button className="p-2 bg-primary rounded-full" type='submit'>
          <LuSendHorizonal size={20} color="aliceblue" />
        </button>
      </Form>

    </div>
  )
}

