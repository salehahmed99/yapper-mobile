import { Message } from '../types';

export const MOCK_CONVERSATIONS: Message[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m',
    unread: true,
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    lastMessage: 'Thanks for the follow!',
    timestamp: '1h',
    unread: false,
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: 'mikej',
    lastMessage: "Let's catch up soon!",
    timestamp: '3h',
    unread: false,
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    username: 'sarahw',
    lastMessage: 'Did you see my last post?',
    timestamp: '1d',
    unread: true,
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    name: 'Alex Brown',
    username: 'alexb',
    lastMessage: 'Thanks for the tip!',
    timestamp: '2d',
    unread: false,
    avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
];

export const getConversationById = (id: string): Message | undefined => {
  return MOCK_CONVERSATIONS.find((conv) => conv.id === id);
};
