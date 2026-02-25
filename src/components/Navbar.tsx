import Link from "next/link";

const isAdmin = process.env.STATIC_EXPORT !== "true";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
          Photos
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-4">
            <Link
              href="/admin/upload"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upload
            </Link>
            <Link
              href="/admin/manage"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Manage
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
