import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {/* Spark icon */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L13.5 9H21L15 13.5L17.5 21L11 16.5L4.5 21L7 13.5L1 9H8.5L11 2Z"
                  fill="url(#footer-grad)" />
                <defs>
                  <linearGradient id="footer-grad" x1="1" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6D5EF5"/>
                    <stop offset="1" stopColor="#22D3EE"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-semibold text-white text-sm">PRD Autopilot</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              Turn vague ideas into engineering-ready PRDs with multi-agent AI.
            </p>
            <p className="text-xs text-gray-600 mt-4">© 2026 PRD Autopilot</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/new',       label: 'New PRD'   },
                { href: '/chat/new',  label: 'AI Chat'   },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Resources</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/erfwn81/PRD-Autopilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-500">
                  Built for MTP World Product Day 2026
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex justify-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-xs text-gray-600">Powered by multi-agent AI — Groq · Supabase · Next.js</p>
        </div>
      </div>
    </footer>
  );
}
