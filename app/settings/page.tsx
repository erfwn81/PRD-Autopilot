'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { User } from '@supabase/supabase-js';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in-up ${
        type === 'success'
          ? 'bg-success/15 text-success border border-success/30'
          : 'bg-danger/15 text-danger border border-danger/30'
      }`}
    >
      {type === 'success' ? '✓' : '⚠'} {message}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.07)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameMsg, setNameMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [nameSaving, setNameSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      setDisplayName((user.user_metadata?.display_name as string | undefined) ?? user.email?.split('@')[0] ?? '');
    });
  }, [router]);

  const handleSaveName = async () => {
    if (!user) return;
    setNameSaving(true);
    setNameMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
    setNameSaving(false);
    if (!error) {
      window.pendo?.track('profile_display_name_updated', {
        display_name_length: displayName.trim().length,
      });
    }
    setNameMsg(error ? { text: error.message, type: 'error' } : { text: 'Display name updated', type: 'success' });
    setTimeout(() => setNameMsg(null), 3500);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMsg({ text: error.message, type: 'error' });
    } else {
      window.pendo?.track('password_changed');
      setPwMsg({ text: 'Password changed successfully', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setTimeout(() => setPwMsg(null), 3500);
  };

  const handleSignOutAll = async () => {
    if (!confirm('Sign out of all devices? You will be redirected to the home page.')) return;
    const supabase = createClient();
    window.pendo?.track('signed_out_all_devices');
    await supabase.auth.signOut({ scope: 'global' });
    router.push('/');
  };

  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-12 space-y-6">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
        </div>

        {/* Profile */}
        <SectionCard title="Profile">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,#6D5EF5,#22D3EE)' }}
            >
              {avatarLetter}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-widest text-gray-500 block mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="input-dark"
                placeholder="Your name"
                maxLength={50}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveName}
                disabled={nameSaving}
                className="btn-primary text-sm px-4 py-2 rounded-lg"
              >
                {nameSaving ? 'Saving…' : 'Save changes'}
              </button>
              {nameMsg && <Toast message={nameMsg.text} type={nameMsg.type} />}
            </div>
          </div>
        </SectionCard>

        {/* Account */}
        <SectionCard title="Account">
          <div className="mb-5">
            <label className="text-xs font-medium uppercase tracking-widest text-gray-500 block mb-1.5">Email</label>
            <input
              type="email"
              value={user.email ?? ''}
              readOnly
              className="input-dark opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed here.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Change password</p>
            <div>
              <label className="text-xs text-gray-500 block mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-dark"
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-dark"
                placeholder="Repeat password"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !newPassword}
                className="btn-primary text-sm px-4 py-2 rounded-lg"
              >
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
              {pwMsg && <Toast message={pwMsg.text} type={pwMsg.type} />}
            </div>
          </div>
        </SectionCard>

        {/* Danger zone */}
        <SectionCard title="Danger Zone">
          <p className="text-sm text-gray-400 mb-4">
            Signing out of all devices will end every active session immediately.
          </p>
          <button
            onClick={handleSignOutAll}
            className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors text-sm px-4 py-2 rounded-lg font-medium"
          >
            Sign out of all devices
          </button>
        </SectionCard>
      </main>
      <Footer />
    </div>
  );
}
