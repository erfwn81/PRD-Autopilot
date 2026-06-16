import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-4 text-center"
      style={{ background: `radial-gradient(ellipse 60% 40% at 50% 40%, rgba(109,94,245,0.10) 0%, transparent 70%), #0A0A0F` }}>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">404</p>
      <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium">
        Back to home
      </Link>
    </div>
  );
}
