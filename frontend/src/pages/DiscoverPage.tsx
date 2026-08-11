import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Heart, X, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  name: string;
  dateOfBirth: string;
  bio?: string;
  occupation?: string;
  location?: string;
  photos: { url: string; order: number }[];
  interests: { interest: { name: string; emoji?: string } }[];
}

export const DiscoverPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeAnim, setSwipeAnim] = useState<'left' | 'right' | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [matched, setMatched] = useState<Profile | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/discover');
      setProfiles(data);
      setCurrentIdx(0);
      setPhotoIdx(0);
    } catch {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const current = profiles[currentIdx];

  const doSwipe = async (action: 'LIKE' | 'PASS' | 'SUPER_LIKE') => {
    if (!current) return;
    setSwipeAnim(action === 'PASS' ? 'left' : 'right');
    try {
      const { data } = await api.post('/discover/swipe', {
        targetId: current.id,
        action,
      });
      if (data.match) setMatched(current);
    } catch { toast.error('Something went wrong'); }

    setTimeout(() => {
      setSwipeAnim(null);
      setCurrentIdx((i) => i + 1);
      setPhotoIdx(0);
      setShowInfo(false);
    }, 400);
  };

  const age = current ? differenceInYears(new Date(), new Date(current.dateOfBirth)) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Heart size={48} className="text-pink-500 fill-pink-500 animate-bounce" />
    </div>
  );

  if (!current) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
      <span className="text-6xl">💕</span>
      <h2 className="text-2xl font-bold text-gray-800">You've seen everyone!</h2>
      <p className="text-gray-500">Check back later for new people nearby.</p>
      <button
        onClick={fetchProfiles}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold"
      >
        Refresh
      </button>
    </div>
  );

  const photos = current.photos.sort((a, b) => a.order - b.order);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          Mapenzi 💕
        </h1>
        <span className="text-sm text-gray-400">{profiles.length - currentIdx} left</span>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-2">
        <div
          ref={cardRef}
          className={`relative h-full rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all
            ${swipeAnim === 'left' ? 'animate-swipe-left' : ''}
            ${swipeAnim === 'right' ? 'animate-swipe-right' : ''}
          `}
        >
          {/* Photo */}
          {photos.length > 0 ? (
            <img
              src={photos[photoIdx]?.url}
              alt={current.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center">
              <span className="text-8xl">👤</span>
            </div>
          )}

          {/* Photo navigation dots */}
          {photos.length > 1 && (
            <>
              <div className="absolute top-3 left-0 right-0 flex gap-1 px-3">
                {photos.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i === photoIdx ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
              <button
                onClick={() => setPhotoIdx(Math.max(0, photoIdx - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPhotoIdx(Math.min(photos.length - 1, photoIdx + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">{current.name}, {age}</h2>
                {current.occupation && <p className="text-sm text-white/80">💼 {current.occupation}</p>}
                {current.location && <p className="text-sm text-white/80">📍 {current.location}</p>}
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
              >
                <Info size={18} />
              </button>
            </div>

            {/* Expanded info */}
            {showInfo && (
              <div className="mt-3 pt-3 border-t border-white/30">
                {current.bio && <p className="text-sm text-white/90 mb-2">{current.bio}</p>}
                {current.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {current.interests.map(({ interest }) => (
                      <span key={interest.name} className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                        {interest.emoji} {interest.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-5 px-4 py-4">
        <button
          onClick={() => doSwipe('PASS')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 hover:border-red-300 hover:scale-110 transition-all"
        >
          <X size={28} className="text-red-400" />
        </button>
        <button
          onClick={() => doSwipe('SUPER_LIKE')}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 hover:border-blue-300 hover:scale-110 transition-all"
        >
          <Star size={20} className="text-blue-400" />
        </button>
        <button
          onClick={() => doSwipe('LIKE')}
          className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
        >
          <Heart size={28} className="text-white fill-white" />
        </button>
      </div>

      {/* Match Modal */}
      {matched && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-8 text-center animate-float-in w-full max-w-sm">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-3xl font-bold text-pink-500 mb-2">It's a Match!</h2>
            <p className="text-gray-500 mb-6">You and {matched.name} liked each other</p>
            {matched.photos[0] && (
              <img src={matched.photos[0].url} alt={matched.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-6 ring-4 ring-pink-400" />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setMatched(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:border-pink-300 transition"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => setMatched(null)}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
