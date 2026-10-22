import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { getViewer } from "@/lib/auth/viewer";
import { roleLabel, vi } from "@/lib/i18n/vi";

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-vmg-red">{vi.app.name}</h1>
        <Suspense fallback={<p className="text-vmg-muted">{vi.home.loading}</p>}>
          <Account />
        </Suspense>
        <Link
          href="/brand/journey"
          className="flex min-h-11 flex-col gap-1 rounded-lg border border-vmg-faint bg-surface-card p-4 hover:border-vmg-red"
        >
          <span className="font-bold">{vi.journey.title}</span>
          <span className="text-vmg-muted">{vi.journey.intro}</span>
        </Link>
        <p className="text-vmg-muted">{vi.home.phase}</p>
      </main>
    </>
  );
}

// Đọc phiên (cookies) lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Account() {
  const viewer = await getViewer();
  if (!viewer) return <p className="text-vmg-muted">{vi.home.noProfile}</p>;

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-surface-card p-4">
      <p>
        {vi.home.greeting}, <strong>{viewer.fullName}</strong> ({roleLabel(viewer.role)})
      </p>
      {viewer.devSeed ? null : (
        <form action="/auth/signout" method="post">
          <button type="submit" className="min-h-11 rounded-md border border-vmg-charcoal px-4 font-medium hover:bg-surface">
            {vi.home.signOut}
          </button>
        </form>
      )}
    </section>
  );
}
