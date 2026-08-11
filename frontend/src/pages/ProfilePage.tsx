import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { differenceInYears } from 'date-fns';
import { Camera, Edit3, MapPin, Briefcase, GraduationCap, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, fetchMe } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    occupation: user?.occupation || '',
    education: user?.education || '',
    location: user?.location || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        bio: user.bio || '',
        occupation: user.occupation || '',
        education: user.education || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const saveProfile = async () => {
    try {
      await api.put('/users/profile', form);
      await fetchMe();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return null;

  const age = differenceInYears(new Date(), new Date(user.dateOfBirth));
  const mainPhoto = user.photos.find((p) => p.isMain) || user.photos[0];

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative h-72 bg-gradient-to-br from-pink-400 to-rose-500">
        {mainPhoto ? (
          <img src={mainPhoto.url} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">👤</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-2xl font-bold">{user.name}, {age}</h1>
          {user.location && <p className="text-sm text-white/80 flex items-center gap-1"><MapPin size={12} />{user.location}</p>}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="absolute top-12 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
        >
          <Edit3 size={18} />
        </button>
        <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white">
          <Camera size={18} />
        </button>
      </div>

      {/* Photos */}
      {user.photos.length > 0 && (
        <div className="px-5 mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {user.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {photo.isMain && (
                  <span className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">Main</span>
                )}
              </div>
            ))}
            <button className="aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-400 transition">
              <Camera size={24} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Info / Edit */}
      <div className="px-5 mt-5">
        {editing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800 text-lg">Edit Profile</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
                <button onClick={saveProfile} className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </button>
              </div>
            </div>
            {[
              { key: 'name', label: 'Name', placeholder: 'Your name' },
              { key: 'occupation', label: 'Occupation', placeholder: 'e.g. Software Engineer' },
              { key: 'education', label: 'Education', placeholder: 'e.g. University of Nairobi' },
              { key: 'location', label: 'Location', placeholder: 'e.g. Nairobi, Kenya' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                maxLength={500}
                placeholder="Tell people about yourself..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{form.bio.length}/500</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {user.bio && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-1">About me</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              {user.occupation && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={18} className="text-pink-400" />
                  <span className="text-sm">{user.occupation}</span>
                </div>
              )}
              {user.education && (
                <div className="flex items-center gap-3 text-gray-600">
                  <GraduationCap size={18} className="text-pink-400" />
                  <span className="text-sm">{user.education}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} className="text-pink-400" />
                  <span className="text-sm">{user.location}</span>
                </div>
              )}
            </div>
            {user.interests.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(({ interest }) => (
                    <span key={interest.id} className="px-3 py-1.5 bg-pink-50 text-pink-600 text-sm rounded-full font-medium">
                      {interest.emoji} {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
