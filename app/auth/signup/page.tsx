'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/dashboard');
      return;
    }

    setConfirmed(true);
    setLoading(false);
  };

  if (confirmed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 bg-background bg-grid"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 40%, rgba(109,94,245,0.12) 0%, transparent 70%), #0A0A0F` }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            We sent a confirmation link to{' '}
            <span className="text-gray-300 font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <a
            href="/auth/login"
            className="btn-primary block w-full py-2.5 text-sm rounded-xl text-center"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-background bg-grid"
      style={{ background: `radial-gradient(ellipse 60% 40% at 50% 40%, rgba(109,94,245,0.12) 0%, transparent 70%), #0A0A0F` }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 0 60px rgba(109,94,245,0.15), 0 30px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-5">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 1.5L12.2 8H19L13.4 11.9L15.6 18.5L10 14.6L4.4 18.5L6.6 11.9L1 8H7.8L10 1.5Z"
                fill="url(#signup-spark)" />
              <defs>
                <linearGradient id="signup-spark" x1="1" y1="1.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6D5EF5"/><stop offset="1" stopColor="#22D3EE"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-white text-sm">PRD Autopilot</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Start writing better PRDs in minutes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-danger"
            style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
            <input type="email" placeholder="you@company.com" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
            <input type="password" placeholder="At least 6 characters" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} className="input-dark" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-2.5 text-sm rounded-xl mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
