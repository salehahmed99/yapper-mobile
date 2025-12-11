import { socketService } from '@/src/services/socketService';

// ============================================================================
// Types for Chat Socket Events
// ============================================================================

// Message types
export type MessageType = 'text' | 'reply' | 'image' | 'video';

// Sender info
export interface IChatSocketSender {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

// Message data from socket (uses snake_case from backend)
export interface IChatSocketMessage {
  id: string;
  content: string;
  sender_id: string;
  message_type: MessageType;
  reply_to?: string | null;
  reply_to_message_id?: string | null;
  image_url?: string | null;
  is_read: boolean;
  is_edited?: boolean;
  created_at: string;
  updated_at?: string;
  sender?: IChatSocketSender;
}

// ============================================================================
// Client -> Server Event Payloads
// ============================================================================

export interface IJoinChatPayload {
  chat_id: string;
}

export interface ILeaveChatPayload {
  chat_id: string;
}

export interface ISendMessagePayload {
  chat_id: string;
  message: {
    content: string;
    message_type: MessageType;
    reply_to_message_id: string | null;
    image_url: string | null;
    is_first_message: boolean;
  };
}

export interface IUpdateMessagePayload {
  chat_id: string;
  message_id: string;
  update: {
    content: string;
  };
}

export interface IReactToMessagePayload {
  chat_id: string;
  message_id: string;
  emoji: string;
}

export interface IDeleteMessagePayload {
  chat_id: string;
  message_id: string;
}

export interface ITypingPayload {
  chat_id: string;
}

export interface IGetMessagesPayload {
  chat_id: string;
  limit?: number;
  before?: string;
}

// ============================================================================
// Server -> Client Event Data
// ============================================================================

export interface IJoinedChatData {
  chatId: string;
  message: string;
}

export interface ILeftChatData {
  chatId: string;
  message: string;
}

export interface IMessageSentData {
  chat_id?: string;
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  reply_to?: string | null;
  reply_to_message_id?: string | null;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

export interface INewMessageData {
  chat_id: string;
  message: IChatSocketMessage;
}

export interface IMessageUpdatedData {
  chatId: string;
  messageId: string;
  message: IChatSocketMessage;
}

export interface IMessageDeletedData {
  chatId: string;
  messageId: string;
}

export interface IUserTypingData {
  chat_id: string;
  user_id: string;
}

export interface IMessagesRetrievedData {
  chatId: string;
  sender: IChatSocketSender;
  messages: IChatSocketMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface IUnreadChatsSummary {
  chats: Array<{
    chat_id: string;
    unread_count: number;
    last_message?: {
      id: string;
      content: string;
      created_at: string;
    };
  }>;
  message: string;
}

export interface ISocketError {
  message: string;
}

export interface IReactionAddedData {
  chat_id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface IReactionRemovedData {
  chat_id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

// ============================================================================
// Event Names
// ============================================================================

// Client -> Server events
export const ChatSocketEvents = {
  // Emit events
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  UPDATE_MESSAGE: 'update_message',
  DELETE_MESSAGE: 'delete_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  GET_MESSAGES: 'get_messages',
  ADD_REACTION: 'add_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // Listen events
  JOINED_CHAT: 'joined_chat',
  LEFT_CHAT: 'left_chat',
  MESSAGE_SENT: 'message_sent',
  NEW_MESSAGE: 'new_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  MESSAGES_RETRIEVED: 'messages_retrieved',
  UNREAD_CHATS_SUMMARY: 'unread_chats_summary',
  REACTION_ADDED: 'reaction_added',
  REACTION_REMOVED: 'reaction_removed',
  ERROR: 'error',
} as const;

// ============================================================================
// Chat Socket Service
// ============================================================================

class ChatSocketService {
  // -------------------------------------------------------------------------
  // Emit Methods (Client -> Server)
  // -------------------------------------------------------------------------

  // Join a chat room to receive real-time messages
  public joinChat(chatId: string): void {
    const payload: IJoinChatPayload = { chat_id: chatId };
    socketService.emit(ChatSocketEvents.JOIN_CHAT, payload);
    console.log('[ChatSocket] Joining chat:', chatId);
  }

  // Leave a chat room
  public leaveChat(chatId: string): void {
    const payload: ILeaveChatPayload = { chat_id: chatId };
    socketService.emit(ChatSocketEvents.LEAVE_CHAT, payload);
    console.log('[ChatSocket] Leaving chat:', chatId);
  }

  // Send a message in a chat
  public sendMessage(
    chatId: string,
    content: string,
    messageType: MessageType = 'text',
    replyTo: string | null = null,
    imageUrl: string | null = null,
    isFirstMessage: boolean = false,
  ): void {
    const payload: ISendMessagePayload = {
      chat_id: chatId,
      message: {
        content,
        message_type: messageType,
        reply_to_message_id: replyTo,
        image_url: imageUrl,
        is_first_message: isFirstMessage,
      },
    };
    socketService.emit(ChatSocketEvents.SEND_MESSAGE, payload);
    console.log('[ChatSocket] Sending message to:', chatId);
  }

  // Update/edit a message
  public updateMessage(chatId: string, messageId: string, content: string): void {
    const payload: IUpdateMessagePayload = {
      chat_id: chatId,
      message_id: messageId,
      update: { content },
    };
    socketService.emit(ChatSocketEvents.UPDATE_MESSAGE, payload);
    console.log('[ChatSocket] Updating message:', messageId);
  }

  // Delete a message
  public deleteMessage(chatId: string, messageId: string): void {
    const payload: IDeleteMessagePayload = {
      chat_id: chatId,
      message_id: messageId,
    };
    socketService.emit(ChatSocketEvents.DELETE_MESSAGE, payload);
    console.log('[ChatSocket] Deleting message:', messageId);
  }

  // Notify that user started typing
  public startTyping(chatId: string): void {
    const payload: ITypingPayload = { chat_id: chatId };
    socketService.emit(ChatSocketEvents.TYPING_START, payload);
  }

  // Notify that user stopped typing
  public stopTyping(chatId: string): void {
    const payload: ITypingPayload = { chat_id: chatId };
    socketService.emit(ChatSocketEvents.TYPING_STOP, payload);
  }

  // Add reaction to a message
  public addReaction(chatId: string, messageId: string, emoji: string): void {
    const payload: IReactToMessagePayload = {
      chat_id: chatId,
      message_id: messageId,
      emoji,
    };
    socketService.emit(ChatSocketEvents.ADD_REACTION, payload);
    console.log('[ChatSocket] Adding reaction to message:', messageId, 'with', emoji);
  }

  // Remove reaction from a message
  public removeReaction(chatId: string, messageId: string, emoji: string): void {
    const payload: IReactToMessagePayload = {
      chat_id: chatId,
      message_id: messageId,
      emoji,
    };
    socketService.emit(ChatSocketEvents.REMOVE_REACTION, payload);
    console.log('[ChatSocket] Removing reaction from message:', messageId);
  }

  // Get paginated messages from a chat via socket
  public getMessages(chatId: string, limit?: number, before?: string): void {
    const payload: IGetMessagesPayload = {
      chat_id: chatId,
      ...(limit && { limit }),
      ...(before && { before }),
    };
    socketService.emit(ChatSocketEvents.GET_MESSAGES, payload);
    console.log('[ChatSocket] Getting messages for:', chatId);
  }

  // -------------------------------------------------------------------------
  // Event Listeners (Server -> Client)
  // -------------------------------------------------------------------------

  // Listen for successful chat join
  public onJoinedChat(callback: (data: IJoinedChatData) => void): void {
    socketService.on(ChatSocketEvents.JOINED_CHAT, callback);
  }

  // Listen for successful chat leave
  public onLeftChat(callback: (data: ILeftChatData) => void): void {
    socketService.on(ChatSocketEvents.LEFT_CHAT, callback);
  }

  // Listen for message sent confirmation
  public onMessageSent(callback: (data: IMessageSentData) => void): void {
    socketService.on(ChatSocketEvents.MESSAGE_SENT, callback);
  }

  // Listen for new incoming messages
  public onNewMessage(callback: (data: INewMessageData) => void): void {
    socketService.on(ChatSocketEvents.NEW_MESSAGE, callback);
  }

  // Listen for message updates
  public onMessageUpdated(callback: (data: IMessageUpdatedData) => void): void {
    socketService.on(ChatSocketEvents.MESSAGE_UPDATED, callback);
  }

  // Listen for message deletions
  public onMessageDeleted(callback: (data: IMessageDeletedData) => void): void {
    socketService.on(ChatSocketEvents.MESSAGE_DELETED, callback);
  }

  // Listen for user typing indicator
  public onUserTyping(callback: (data: IUserTypingData) => void): void {
    socketService.on(ChatSocketEvents.USER_TYPING, callback);
  }

  // Listen for user stopped typing
  public onUserStoppedTyping(callback: (data: IUserTypingData) => void): void {
    socketService.on(ChatSocketEvents.USER_STOPPED_TYPING, callback);
  }

  // Listen for retrieved messages (pagination via socket)
  public onMessagesRetrieved(callback: (data: IMessagesRetrievedData) => void): void {
    socketService.on(ChatSocketEvents.MESSAGES_RETRIEVED, callback);
  }

  // Listen for unread chats summary (sent on connection)
  public onUnreadChatsSummary(callback: (data: IUnreadChatsSummary) => void): void {
    socketService.on(ChatSocketEvents.UNREAD_CHATS_SUMMARY, callback);
  }

  // Listen for socket errors
  public onError(callback: (data: ISocketError) => void): void {
    socketService.on(ChatSocketEvents.ERROR, callback);
  }

  // Listen for reaction added
  public onReactionAdded(callback: (data: IReactionAddedData) => void): void {
    socketService.on(ChatSocketEvents.REACTION_ADDED, callback);
  }

  // Listen for reaction removed
  public onReactionRemoved(callback: (data: IReactionRemovedData) => void): void {
    socketService.on(ChatSocketEvents.REACTION_REMOVED, callback);
  }

  // -------------------------------------------------------------------------
  // Remove Listeners
  // -------------------------------------------------------------------------

  public offJoinedChat(callback: (data: IJoinedChatData) => void): void {
    socketService.off(ChatSocketEvents.JOINED_CHAT, callback);
  }

  public offLeftChat(callback: (data: ILeftChatData) => void): void {
    socketService.off(ChatSocketEvents.LEFT_CHAT, callback);
  }

  public offMessageSent(callback: (data: IMessageSentData) => void): void {
    socketService.off(ChatSocketEvents.MESSAGE_SENT, callback);
  }

  public offNewMessage(callback: (data: INewMessageData) => void): void {
    socketService.off(ChatSocketEvents.NEW_MESSAGE, callback);
  }

  public offMessageUpdated(callback: (data: IMessageUpdatedData) => void): void {
    socketService.off(ChatSocketEvents.MESSAGE_UPDATED, callback);
  }

  public offMessageDeleted(callback: (data: IMessageDeletedData) => void): void {
    socketService.off(ChatSocketEvents.MESSAGE_DELETED, callback);
  }

  public offUserTyping(callback: (data: IUserTypingData) => void): void {
    socketService.off(ChatSocketEvents.USER_TYPING, callback);
  }

  public offUserStoppedTyping(callback: (data: IUserTypingData) => void): void {
    socketService.off(ChatSocketEvents.USER_STOPPED_TYPING, callback);
  }

  public offMessagesRetrieved(callback: (data: IMessagesRetrievedData) => void): void {
    socketService.off(ChatSocketEvents.MESSAGES_RETRIEVED, callback);
  }

  public offUnreadChatsSummary(callback: (data: IUnreadChatsSummary) => void): void {
    socketService.off(ChatSocketEvents.UNREAD_CHATS_SUMMARY, callback);
  }

  public offError(callback: (data: ISocketError) => void): void {
    socketService.off(ChatSocketEvents.ERROR, callback);
  }

  public offReactionAdded(callback: (data: IReactionAddedData) => void): void {
    socketService.off(ChatSocketEvents.REACTION_ADDED, callback);
  }

  public offReactionRemoved(callback: (data: IReactionRemovedData) => void): void {
    socketService.off(ChatSocketEvents.REACTION_REMOVED, callback);
  }
}

export const chatSocketService = new ChatSocketService();
