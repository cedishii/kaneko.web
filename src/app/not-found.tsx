import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-start justify-center px-4 pt-24 sm:px-6">
      <p className="font-mono text-sm text-accent">❯ cd ./this-page</p>
      <p className="mt-1 font-mono text-sm text-muted">bash: cd: no such file or directory</p>
      <h1 className="mt-6 text-4xl font-bold text-ink">404 · Page not found</h1>
      <p className="mt-3 text-muted">The page you were looking for doesn&apos;t exist or has moved.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg border border-accent/50 bg-accent-strong/10 px-5 py-3 font-mono text-sm text-accent-soft hover:bg-accent-strong/20"
      >
        cd ~
      </Link>
    </section>
  );
}
