'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();

  // Stores user input from the signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Controls loading state and displays authentication errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Creates a new user account using Supabase Authentication.
   * On success, the user is redirected to the dashboard.
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset UI state before submitting
    setLoading(true);
    setError('');

    const supabase = createClient();

    // Create a new user account in Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Display authentication errors to the user
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect newly registered users to the dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        {/* Error message shown when signup fails */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* User email input */}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Password input with minimum length requirement */}
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Submit button displays loading state while request is processing */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Link for users who already have an account */}
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <a href="/auth/login" className="text-indigo-600">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}