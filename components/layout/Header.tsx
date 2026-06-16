'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 1.5L12.2 8H19L13.4 11.9L15.6 18.5L10 14.6L4.4 18.5L6.6 11.9L1 8H7.8L10 1.5Z"
        fill="url(#spark-grad)"
      />
      <defs>
        <linearGradient id="spark-grad" x1="1" y1="1.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EF5" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const displayName = (user?.user_metadata?.display_name as string | undefined)
    || user?.email?.split('@')[0]
    || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 group"
        >
          <SparkIcon />
          <span className="font-semibold text-white text-sm group-hover:opacity-80 transition-opacity">
            PRD Autopilot
          </span>
        </Link>

        {/* Right */}
        <nav className="flex items-center gap-2">
          {loading ? (
            <div className="h-7 w-28 rounded-lg shimmer-bg" />
          ) : user ? (
            <>
              {/* New PRD primary button */}
              <Link
                href="/new"
                className="btn-primary text-xs px-3 py-1.5 rounded-lg hidden sm:inline-flex"
              >
                New PRD
              </Link>

              {/* Avatar + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6D5EF5,#22D3EE)' }}
                  >
                    {avatarLetter}
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl py-1 z-50 overflow-hidden"
                    style={{
                      background: '#1A1A26',
                      border: '1px solid rgba(255,255,255,0.10)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-sm font-medium text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    {[
                      { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
                      { href: '/settings',  label: 'Settings',  icon: '⚙' },
                    ].map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="text-gray-500 text-xs">{icon}</span>
                        {label}
                      </Link>
                    ))}

                    <div className="my-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <span className="text-xs">⏻</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm px-4 py-1.5 rounded-lg">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
