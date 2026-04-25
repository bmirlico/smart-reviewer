import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';

type RouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              SR
            </span>
            <span className="font-semibold text-neutral-900 group-hover:text-indigo-700 transition-colors">
              Smart Reviewer
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/">Search</NavLink>
            <NavLink to="/results">Results</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-neutral-500">
          Powered by GNews + OpenAI · Rails 8.1 · React 19
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: '/' | '/results'; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors [&.active]:text-indigo-700 [&.active]:bg-indigo-50"
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}
