import { encryptData } from "@/lib/E2EE";
import { sendMessage } from "@/lib/api";
import { socket } from "@/lib/socket";
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import { store } from "@/rtk/store";
import { SocketMessage } from "@/utils/types";
import { v4 as uuidv4 } from 'uuid';

export async function action({ request, params }: { request: Request, params: {id:string} }) {
  try {
    const form: FormData = await request.formData();
    const message: string = form.get('message')?.toString() || '';
    const token: string | null = store.getState().auth.accessToken;
    const username: string | null = store.getState().auth.username;
    const id: string | null = store.getState().auth.userId;

    if (!token || !username || !id) {
      throw {
        message: "You are not authenticated. Please login",
        statusText: "Unauthorized",
        status: 401,
      };
    }
    
    const chatId: string = params.id;
    const url: URL = new URL(request.url);
    const receiverName: string | null = url.searchParams.get("name");
    const receiverId: string | null = url.searchParams.get("re");
    const chatType: string | null = url.searchParams.get("type");
    
    if (!chatType || (chatType !== "individual" && chatType !== "group")) {
      throw {
        message: "Invalid chat type. Please go back and try again",
        statusText: "Bad Request",
        status: 400,
      };
    }
    
    if (chatType==='individual' && !receiverId || !receiverName) {
      window.location.href = '/chats';
      return { message: "Session Error. Failed to send the message", success: false };
    }
    
    
    const today: Date = new Date();
    const messageId: string = uuidv4();
    
    const encryptionKey: string | undefined = store.getState().key.encryptionKey;
    
    if (!encryptionKey) {
      throw {
        message: "Something went wrong. Please go back and try again",
        statusText: "Bad Request",
        status: 400,
      };
    }
    const encryptedMessage = await encryptData(message, encryptionKey);

    // Create the message object in plain text form
    const data: SocketMessage = {
      _id: messageId,
      chat_id: chatId,
      message: encryptedMessage, // Plain text message
      sender: {
        _id: id,
        avatar: '',
        username: username,
      },
      receiver: {
        _id: receiverId || '',
        avatar: '',
        username: receiverName,
      },
      created_at: today.toISOString(),
      chat_type: chatType,
    };

    store.dispatch(setSocketMsg(data));

    socket.emit('send-message', data); // Emit with plain text for immediate feedback
    await sendMessage(encryptedMessage, token, messageId, chatId);

    return { message: "Message Sent", success: true };
  } catch (error: unknown) {
    return { message: "Failed to send the message", success: false };
  }
}