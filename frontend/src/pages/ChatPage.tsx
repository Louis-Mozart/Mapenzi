import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { ChevronLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

export const ChatPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages, typingUsers, setTyping } = useChatStore();
  const [input, setInput] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhoto, setPartnerPhoto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchMessages = messages[matchId!] || [];

  useEffect(() => {
    if (!matchId) return;

    // Fetch messages from API
    api.get(`/messages/${matchId}`).then(({ data }) => {
      setMessages(matchId, data);
      if (data.length > 0) {
        const partner = data.find((m: any) => m.senderId !== user?.id)?.sender;
        if (partner) {
          setPartnerName(partner.name);
          setPartnerPhoto(partner.photos[0]?.url || '');
        }
      }
    });

    // Fetch match info for header
    api.get('/matches').then(({ data }) => {
      const match = data.find((m: any) => m.id === matchId);
      if (match) {
        setPartnerName(match.partner.name);
        setPartnerPhoto(match.partner.photos[0]?.url || '');
      }
    });

    // Socket setup
    const socket = getSocket();
    socket.emit('join_match', matchId);

    socket.on('new_message', (msg: any) => {
      if (msg.matchId === matchId) addMessage(matchId, msg);
    });

    socket.on('partner_typing', ({ isTyping }: { userId: string; isTyping: boolean }) => {
      setTyping(matchId, isTyping);
    });

    return () => {
      socket.emit('leave_match', matchId);
      socket.off('new_message');
      socket.off('partner_typing');
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [matchMessages]);

  const sendMessage = () => {
    if (!input.trim() || !matchId) return;
    const socket = getSocket();
    socket.emit('send_message', { matchId, content: input.trim() });
    setInput('');
  };

  const handleTyping = (val: string) => {
    setInput(val);
    const socket = getSocket();
    socket.emit('typing', { matchId, isTyping: true });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { matchId, isTyping: false });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white shadow-sm">
        <Link to="/matches" className="text-gray-500 hover:text-pink-500">
          <ChevronLeft size={24} />
        </Link>
        {partnerPhoto ? (
          <img src={partnerPhoto} alt={partnerName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">👤</div>
        )}
        <div>
          <h2 className="font-semibold text-gray-800">{partnerName || '...'}</h2>
          <p className="text-xs text-green-400">
            {typingUsers[matchId!] ? 'typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {matchMessages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-4xl mb-2">💕</p>
            <p className="text-gray-400 text-sm">You matched! Send the first message</p>
          </div>
        )}
        {matchMessages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        {typingUsers[matchId!] && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-3 items-center">
        <input
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};
