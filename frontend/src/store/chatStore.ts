import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  matchId: string;
  senderId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  sender: { id: string; name: string; photos: { url: string }[] };
}

interface ChatState {
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  addMessage: (matchId: string, message: Message) => void;
  setMessages: (matchId: string, messages: Message[]) => void;
  setTyping: (matchId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typingUsers: {},

  addMessage: (matchId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    })),

  setMessages: (matchId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [matchId]: messages },
    })),

  setTyping: (matchId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [matchId]: isTyping },
    })),
}));
