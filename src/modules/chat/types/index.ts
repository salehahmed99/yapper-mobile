// Legacy type for mock data (deprecated)
export interface Message {
  id: string;
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'read';
}

export interface IParticipant {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface ILastMessage {
  id: string;
  content: string;
  messageType: 'text' | 'reply' | 'image' | 'video';
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

export interface IChat {
  id: string;
  participant: IParticipant;
  lastMessage: ILastMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IChatPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IGetChatsResponse {
  data: {
    data: IChat[];
    pagination: IChatPagination;
  };
  count: number;
  message: string;
}

// Chat Messages types
export interface IChatMessageSender {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface IChatMessageItem {
  id: string;
  content: string;
  messageType: 'text' | 'reply' | 'image' | 'video';
  replyTo: string | null;
  replyToMessage?: {
    id: string;
    content: string;
    senderId: string;
  } | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  senderId?: string;
}

// Reply context for UI state management
export interface IReplyContext {
  messageId: string;
  content: string;
  senderName: string;
}

export interface IChatMessagesData {
  chatId: string;
  sender: IChatMessageSender;
  messages: IChatMessageItem[];
}

export interface IGetMessagesResponse {
  data: {
    data: IChatMessagesData;
    pagination: IChatPagination;
  };
  count: number;
  message: string;
}
