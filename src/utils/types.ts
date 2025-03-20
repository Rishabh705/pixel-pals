import { JwtPayload } from "jwt-decode";

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  username: string | null;
}
export interface User {
  _id: string;
  username: string;
  avatar: string;
  email?: string;
}

export interface Message {
  _id: string;
  message: string;
  sender: User;
  created_at: string;
  chat_type: "individual" | "group";
}

export interface DecryptedMessage extends Omit<Message, 'message'> {
  message: string;
}

export interface SocketMessage extends Omit<Message, 'sender'> {
  chat_id: string;
  sender: User;
  receiver: User;
}

export interface DecryptedSocketMessage extends Omit<SocketMessage, 'message'> {
  message: string;
}


export interface BaseChat {
  chat_id: string;
  created_at: string;
  lastmessage: Message;
  chat_type: "individual" | "group";
  encrypted_aes_key: string;
}

export interface IndividualChat extends BaseChat {
  participant1: User;
  participant2: User;
}

export interface DecryptedIndividualChat extends Omit<IndividualChat, 'lastmessage'> {
  lastmessage: DecryptedMessage;
}



export interface GroupChat extends BaseChat {
  name: string;
  owner: User;
  description: string;
}

export interface DetailedIndividualChat extends IndividualChat {
  messages: Message[];
}

export interface DetailedGroupChat extends GroupChat {
  messages: Message[];
}

export interface ChatData {
  individualChats: IndividualChat[];
  groupChats: GroupChat[];
}


export interface SocketChat {
  chatId: string;
}

export interface JWTPayload extends JwtPayload {
  UserInfo: {
    username: string;

    email: string;

    _id: string
  }
}

export interface Keys {
  user_id: string,
  publicKey: string
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RegisterResponse = ApiResponse<{ message: string }>;

export type LoginResponse = ApiResponse<{ message: string; accessToken: string }>;

export interface UserChatsResponse extends ApiResponse<{
  individualChats: IndividualChat[];
  groupChats: GroupChat[];
}> {}

export interface SendMessageResponse extends ApiResponse<{
  _id: string;
  message: string;
  sender: string;
  chat_id: string;
  chat_type: "individual" | "group";
  created_at: string;
  updated_at: string;
}> {}

export interface ChatDetailsResponse extends ApiResponse<{
  chat_id: string;
  type: "individual" | "group";
  participant1: User;
  participant2: User;
  messages: Message[];
  created_at: string;
}> {}

