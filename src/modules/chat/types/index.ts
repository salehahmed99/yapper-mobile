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
