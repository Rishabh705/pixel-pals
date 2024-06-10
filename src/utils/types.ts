export interface AuthState {
  userId : string| null;
  email : string| null;
  username : string| null;
  token : string| null;
}
export interface User {
  _id: string;
  username: string;
  avatar: string;
}

export interface Message {
  _id: string;
  message: string;
  sender: User;
  created_at: string;
}

export interface BaseChat {
  chat_id: string;
  created_at: string;
  lastmessage: Message;
}

export interface IndividualChat extends BaseChat {
  participant1: User;
  participant2: User;
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

export interface SocketMessage extends Message {
  chat_id: string;
  receiver: User;
}

export interface SocketChat {
  chatId: string;
}