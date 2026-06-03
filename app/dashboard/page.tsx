import Link from 'next/link';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/server';
import type { PRDSession } from '@/types';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function statusClasses(status: PRDSession['status']) {
  if (status === 'complete') {
    return 'bg-green-100 text-green-700';
  }

  if (status === 'generating') {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-gray-100 text-gray-700';
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessions: PRDSession[] = [];

  if (user) {
    const { data } = await supabase
      .from('prd_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    sessions = data ?? [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">My PRDs</h1>
            <p className="mt-2 text-sm text-gray-500">
              View your PRD history and continue unfinished interviews.
            </p>
          </div>

          <Link
            href="/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New PRD →
          </Link>
        </div>

        {!user ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Sign in required</h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to see your saved PRDs.
            </p>
            <Link
              href="/auth/login"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign in
            </Link>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              You haven&apos;t created any PRDs yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Start with a rough feature idea and PRD Autopilot will interview you.
            </p>
            <Link
              href="/new"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Start your first PRD →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((session) => {
              const href =
                session.status === 'complete'
                  ? `/prd/${session.id}/result`
                  : `/prd/${session.id}`;

              return (
                <Link
                  key={session.id}
                  href={href}
                  className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-base font-semibold text-gray-900">
                      {session.title || 'Untitled PRD'}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-500">
                    {session.initial_input}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                    <span>Created {formatDate(session.created_at)}</span>
                    <span className="font-medium text-indigo-600">
                      {session.status === 'complete' ? 'View PRD →' : 'Continue →'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}