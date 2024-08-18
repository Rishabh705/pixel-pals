import { v4 as uuidv4 } from 'uuid';
import { getChat, sendMessage } from "@/lib/api";
import { defer, useLoaderData, useParams } from "react-router-dom";
import { store } from "@/rtk/store";
import { SocketMessage } from "@/utils/types";
import { requireAuth } from "@/lib/requireAuth";
import { socket } from "@/lib/socket"
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import RenderChat from "./RenderChat";


export async function loader({ params, request }: { params: any, request: Request }) {
  await requireAuth(request)
  const token: (string | null) = store.getState().auth.accessToken
  if (!token) return { data: [] }

  socket.emit('join-chat', params.id);

  const data: (Promise<any>) = getChat(params.id, token)
  return defer({ data })
}

export async function action({ request, params }: { request: Request, params: any }) {
  try {
    const form: FormData = await request.formData()
    const message: string = form.get('message')?.toString() || ''
    const token: (string | null) = store.getState().auth.accessToken
    const username: (string | null) = store.getState().auth.username
    const id: (string | null) = store.getState().auth.userId


    const chatId: string = params.id

    const url = new URL(request.url);
    const receiverName: string =  url.searchParams.get("name") || '';
    const receiverId: string =  url.searchParams.get("re") || '';


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

    return null

  } catch (error: any) {
    return error.message
  }

}

export default function UpdateChat() {
  const results: any = useLoaderData()
  const { id } = useParams()

  if (!id) throw new Error('Chat not found')

  return (

    <RenderChat results={results.data} method='put' chatId={id} />
  )
}

