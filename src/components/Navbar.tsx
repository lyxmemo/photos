import Link from "next/link";

const isAdmin = process.env.STATIC_EXPORT !== "true";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-lg dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          Photos
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/upload"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Upload
            </Link>
            <Link
              href="/admin/manage"
              className="text-xs text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Manage
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
