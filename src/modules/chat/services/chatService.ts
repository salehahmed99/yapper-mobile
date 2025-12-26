import api from '@/src/services/apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';
import {
  IChat,
  IChatMessageItem,
  IChatMessagesData,
  IChatPagination,
  ICreateChatData,
  ICreateChatResponse,
  IGetChatsResponse,
  IGetMessagesResponse,
  IUserSearchPagination,
  IUserSearchResponse,
  IUserSearchResult,
} from '../types';

export interface IGetChatsParams {
  limit?: number;
  cursor?: string;
}

export interface IGetChatsResult {
  chats: IChat[];
  pagination: IChatPagination;
}

// Get paginated list of chats for the authenticated user
export const getChats = async (params?: IGetChatsParams): Promise<IGetChatsResult> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/chat?${queryString}` : '/chat';

    const response = await api.get<IGetChatsResponse>(url);

    return {
      chats: response.data.data.data,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Get a specific chat by ID
export const getChatById = async (chatId: string): Promise<IChat> => {
  try {
    const response = await api.get<{ data: IChat }>(`/chat/${chatId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export interface IGetMessagesParams {
  chatId: string;
  limit?: number;
  cursor?: string;
}

export interface IGetMessagesResult {
  chatId: string;
  sender: IChatMessagesData['sender'];
  messages: IChatMessageItem[];
  pagination: IChatPagination;
}

// Get paginated messages for a specific chat
export const getMessages = async (params: IGetMessagesParams): Promise<IGetMessagesResult> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/messages/chats/${params.chatId}/messages?${queryString}`
      : `/messages/chats/${params.chatId}/messages`;

    const response = await api.get<IGetMessagesResponse>(url);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messagesWithSenderId = response.data.data.data.messages.map((msg: any) => ({
      ...msg,
      senderId: msg.sender?.id || msg.sender_id || msg.senderId,
      imageUrl: msg.imageUrl || msg.image_url || null,
      voiceNoteUrl: msg.voiceNoteUrl || msg.voice_note_url || null,
      voiceNoteDuration: msg.voiceNoteDuration || msg.voice_note_duration || null,
      reactions: (msg.reactions || []).map((r: any) => {
        const reactedByMe = r.reactedByMe ?? r.reacted_by_me ?? false;
        // Calculate if others reacted. In 1-on-1, this logic effectively flags if the other user reacted.
        const count = r.count || 0;
        const participantCount = reactedByMe ? 1 : 0;
        const reactedByOther = count > participantCount;

        return {
          emoji: r.emoji,
          count: count,
          reactedByMe: reactedByMe,
          reactedByOther: reactedByOther,
        };
      }),
    }));

    return {
      chatId: response.data.data.data.chatId,
      sender: response.data.data.data.sender,
      messages: messagesWithSenderId,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// User Search types
export interface ISearchUsersParams {
  query: string;
  username?: string;
  cursor?: string;
  limit?: number;
}

export interface ISearchUsersResult {
  users: IUserSearchResult[];
  pagination: IUserSearchPagination;
}

// Search users by query
export const searchUsers = async (params: ISearchUsersParams): Promise<ISearchUsersResult> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);

    if (params.username) {
      queryParams.append('username', params.username);
    }
    if (params.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/search/users?${queryParams.toString()}`;
    const response = await api.get<IUserSearchResponse>(url);

    return {
      users: response.data.data.data,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Create Chat types
export interface ICreateChatParams {
  recipientId: string;
}

export interface ICreateChatResult {
  chat: ICreateChatData;
  message: string;
}

// Create a new chat with a user
export const createChat = async (params: ICreateChatParams): Promise<ICreateChatResult> => {
  try {
    const response = await api.post<ICreateChatResponse>('/chat', {
      recipientId: params.recipientId,
    });

    return {
      chat: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export interface IUploadImageResponse {
  data: {
    imageUrl: string;
  };
  count: number;
  message: string;
}

export interface IUploadImageResult {
  imageUrl: string;
}

export const uploadMessageImage = async (imageUri: string): Promise<IUploadImageResult> => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    const response = await api.post<IUploadImageResponse>('/messages/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      imageUrl: response.data.data.imageUrl,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Voice Note Upload types
export interface IUploadVoiceNoteResponse {
  data: {
    voiceNoteUrl: string;
    duration: string;
  };
  count: number;
  message: string;
}

export interface IUploadVoiceNoteResult {
  voiceNoteUrl: string;
  duration: string;
}

// Convert seconds to MM:SS format
const formatDurationMMSS = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const uploadVoiceNote = async (voiceUri: string, durationSeconds: number): Promise<IUploadVoiceNoteResult> => {
  try {
    const formData = new FormData();
    const filename = voiceUri.split('/').pop() || 'voice.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/m4a';

    formData.append('voice_note', {
      uri: voiceUri,
      name: filename,
      type,
    } as unknown as Blob);

    formData.append('duration', formatDurationMMSS(durationSeconds));

    const response = await api.post<IUploadVoiceNoteResponse>('/messages/voices/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.warn('Voice note uploaded:', response.data);

    return {
      voiceNoteUrl: response.data.data.voiceNoteUrl,
      duration: response.data.data.duration,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
