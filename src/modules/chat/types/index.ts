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
  imageUrl?: string | null;
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

// Message reaction type
export interface IMessageReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
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
  imageUrl?: string | null;
  reactions?: IMessageReaction[];
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
  hasImage?: boolean;
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

// User Search types
export interface IUserSearchResult {
  userId: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  followers: number;
  following: number;
  isFollowing: boolean;
  isFollower: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

export interface IUserSearchPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IUserSearchResponse {
  data: {
    data: IUserSearchResult[];
    pagination: IUserSearchPagination;
  };
  count: number;
  message: string;
}

// Create Chat types
export interface ICreateChatParticipant {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface ICreateChatData {
  id: string;
  participants: ICreateChatParticipant[];
  createdAt: string;
  updatedAt: string;
  lastMessage: ILastMessage | null;
}

export interface ICreateChatResponse {
  data: ICreateChatData;
  message: string;
}
