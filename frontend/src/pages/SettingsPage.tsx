import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { LogOut, Bell, Shield, ChevronRight, Heart, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../lib/socket';

export const SettingsPage = () => {
  const { user, logout, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    minAge: user?.minAge || 18,
    maxAge: user?.maxAge || 50,
    maxDistance: user?.maxDistance || 100,
    lookingFor: user?.lookingFor || 'EVERYONE',
  });

  const savePrefs = async () => {
    try {
      await api.put('/users/profile', prefs);
      await fetchMe();
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  return (
    <div className="px-5 pt-14 pb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Discovery Preferences */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Sliders size={18} className="text-pink-500" />
          <h2 className="font-semibold text-gray-700">Discovery Preferences</h2>
        </div>
        <div className="p-4 space-y-5">
          {/* Looking For */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Show me</label>
            <div className="grid grid-cols-3 gap-2">
              {['MEN', 'WOMEN', 'EVERYONE'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPrefs((p) => ({ ...p, lookingFor: opt }))}
                  className={`py-2 text-sm rounded-xl border-2 font-medium transition ${
                    prefs.lookingFor === opt
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {opt === 'MEN' ? '👨 Men' : opt === 'WOMEN' ? '👩 Women' : '💕 All'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Age Range: <span className="text-pink-500 font-semibold">{prefs.minAge} – {prefs.maxAge}</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Min age</p>
                <input
                  type="range" min={18} max={prefs.maxAge - 1}
                  value={prefs.minAge}
                  onChange={(e) => setPrefs((p) => ({ ...p, minAge: +e.target.value }))}
                  className="w-full accent-pink-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Max age</p>
                <input
                  type="range" min={prefs.minAge + 1} max={80}
                  value={prefs.maxAge}
                  onChange={(e) => setPrefs((p) => ({ ...p, maxAge: +e.target.value }))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Max Distance: <span className="text-pink-500 font-semibold">{prefs.maxDistance} km</span>
            </label>
            <input
              type="range" min={5} max={500} step={5}
              value={prefs.maxDistance}
              onChange={(e) => setPrefs((p) => ({ ...p, maxDistance: +e.target.value }))}
              className="w-full accent-pink-500"
            />
          </div>

          <button
            onClick={savePrefs}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        {[
          { icon: Bell, label: 'Notifications', desc: 'Manage your notifications' },
          { icon: Shield, label: 'Privacy & Safety', desc: 'Control your data' },
          { icon: Heart, label: 'Subscription', desc: 'Upgrade for more features' },
        ].map(({ icon: Icon, label, desc }) => (
          <button key={label} className="w-full flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
            <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-pink-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* User info */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="font-semibold text-gray-800">{user?.email}</p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border-2 border-red-200 text-red-500 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
};
