import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { differenceInYears, formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';

interface Match {
  id: string;
  createdAt: string;
  partner: {
    id: string;
    name: string;
    dateOfBirth: string;
    occupation?: string;
    photos: { url: string }[];
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
}

export const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches')
      .then(({ data }) => setMatches(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Heart size={40} className="text-pink-500 fill-pink-500 animate-bounce" />
    </div>
  );

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Matches</h1>
      <p className="text-gray-400 text-sm mb-6">{matches.length} connection{matches.length !== 1 ? 's' : ''}</p>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
          <span className="text-5xl">💔</span>
          <h3 className="text-xl font-semibold text-gray-700">No matches yet</h3>
          <p className="text-gray-400 text-sm">Keep swiping to find your match!</p>
          <Link
            to="/discover"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold"
          >
            Discover People
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const age = differenceInYears(new Date(), new Date(match.partner.dateOfBirth));
            const photo = match.partner.photos[0]?.url;
            return (
              <Link
                key={match.id}
                to={`/messages/${match.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Avatar */}
                <div className="relative">
                  {photo ? (
                    <img src={photo} alt={match.partner.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-2xl">👤</div>
                  )}
                  {/* Online dot */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-gray-800">{match.partner.name}, {age}</h3>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(match.lastMessage?.createdAt || match.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {match.lastMessage
                      ? match.lastMessage.content
                      : '💕 You matched! Say hello'}
                  </p>
                </div>

                <MessageCircle size={20} className="text-pink-400 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
