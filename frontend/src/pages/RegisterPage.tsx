import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = ['Basic Info', 'About You', 'Preferences'];

export const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    lookingFor: '',
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) { setStep(step + 1); return; }
    try {
      await register(form);
      navigate('/discover');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <Heart size={30} className="text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Mapenzi</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-pink-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{steps[step]}</h2>
        <p className="text-gray-400 text-sm mb-6">Step {step + 1} of {steps.length}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={form.dateOfBirth}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => update('gender', g)}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                        form.gender === g
                          ? 'border-pink-500 bg-pink-50 text-pink-600'
                          : 'border-gray-200 text-gray-500 hover:border-pink-300'
                      }`}
                    >
                      {g === 'MALE' ? '👨 Man' : g === 'FEMALE' ? '👩 Woman' : '🌈 Other'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">I'm looking for...</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'MEN', label: '👨 Men', desc: 'Show me men' },
                  { value: 'WOMEN', label: '👩 Women', desc: 'Show me women' },
                  { value: 'EVERYONE', label: '💕 Everyone', desc: 'Show me everyone' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('lookingFor', value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                      form.lookingFor === value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <span className="text-2xl">{label.split(' ')[0]}</span>
                    <div>
                      <p className="font-medium text-gray-800">{label.split(' ')[1]}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-pink-300 transition"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60"
            >
              {step < steps.length - 1 ? 'Continue' : isLoading ? 'Creating account...' : 'Join Mapenzi 💕'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
