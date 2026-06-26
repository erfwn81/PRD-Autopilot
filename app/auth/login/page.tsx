'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
    window.pendo?.track('user_logged_in', {
      redirect_to: redirectTo,
    });
    router.push(redirectTo);
    router.refresh();
  };

  return (
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
              fill="url(#login-spark)" />
            <defs>
              <linearGradient id="login-spark" x1="1" y1="1.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6D5EF5"/><stop offset="1" stopColor="#22D3EE"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-semibold text-white text-sm">PRD Autopilot</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm text-danger"
          style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
          <input
            type="password"
            placeholder="Your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2.5 text-sm rounded-xl mt-2"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Need an account?{' '}
        <a href="/auth/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Create one free
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-background bg-grid"
      style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 40%, rgba(109,94,245,0.12) 0%, transparent 70%), #0A0A0F`,
      }}
    >
      <Suspense fallback={<div className="w-full max-w-sm rounded-2xl p-8 h-64 shimmer-bg" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
