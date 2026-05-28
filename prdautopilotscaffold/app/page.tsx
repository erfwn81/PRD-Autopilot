import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-lg text-indigo-600 tracking-tight">PRD Autopilot</span>
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-4">
          World Product Day 2026
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
          Turn a vague idea into a{' '}
          <span className="text-indigo-600">complete PRD</span>{' '}
          in 5 minutes
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          AI-powered conversational interview. 5 targeted questions. One production-ready Product Requirements Document.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/new"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Start a PRD — it&apos;s free
          </Link>
          <Link
            href="/auth/signup"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 grid sm:grid-cols-3 gap-6">
        {[
          { n: '1', title: 'Describe your idea', desc: '2–3 sentences. No structure needed.' },
          { n: '2', title: '5 clarifying questions', desc: 'AI asks exactly what a senior PM would ask.' },
          { n: '3', title: 'Complete PRD', desc: '10 sections, export to Notion, PDF, or Markdown.' },
        ].map((step) => (
          <div key={step.n} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mb-4">
              {step.n}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
