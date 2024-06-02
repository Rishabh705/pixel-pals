export interface AuthState {
    userId: string | null
    username: string | null
    token: string | null
}

// Define the type for a User
export interface User {
    _id: string;
    username: string;
    avatar: string;
  }
  
  // Define the type for a Message
  export interface Message {
    _id: string;
    message: string;
    sender: User;
    chat: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Define the type for an Individual Chat
  export interface IndividualChat {
    _id: string;
    participants: User[];
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    lastMessage: Message;
  }
  
  // Define the type for a Group Chat
  export interface GroupChat {
    _id: string;
    name: string;
    owner: string;
    admins: string[];
    members: string[];
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    lastMessage: Message;
  }
  
  // Define the Chat interface
  export type Chat = IndividualChat | GroupChat;
  
  // Define the type for the data structure returned by the API
  export interface IndividualChatData {
    _id: string;
    type: 'IndividualChat';
    chat: IndividualChat;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface GroupChatData {
    _id: string;
    type: 'GroupChat';
    chat: GroupChat;
    createdAt: string;
    updatedAt: string;
  }

  export interface DetailedChatData {
    _id: string;
    type: 'IndividualChat' | 'GroupChat';
    chat: IndividualChat | GroupChat;
    createdAt: string;
    updatedAt: string;
}

  export interface ChatData {
    individualChats: IndividualChatData[];
    groupChats: GroupChatData[];
  }

  export interface SocketMessage {
    _id: string;
    chatId: string;
    sender:User;
    message: string;
    createdAt: string;
  }