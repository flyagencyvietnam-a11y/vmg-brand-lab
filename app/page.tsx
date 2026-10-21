import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { roleLabel, vi } from "@/lib/i18n/vi";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-vmg-red">{vi.app.name}</h1>
      <Suspense fallback={<p className="text-vmg-muted">{vi.home.loading}</p>}>
        <Account />
      </Suspense>
      <p className="text-vmg-muted">{vi.home.phase}</p>
    </main>
  );
}

// Đọc phiên (cookies) lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // proxy.ts đã chuyển người chưa đăng nhập về /login

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return <p className="text-vmg-muted">{vi.home.noProfile}</p>;

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-surface-card p-4">
      <p>
        {vi.home.greeting}, <strong>{profile.full_name}</strong> ({roleLabel(profile.role)})
      </p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="min-h-11 rounded-md border border-vmg-charcoal px-4 font-medium hover:bg-surface"
        >
          {vi.home.signOut}
        </button>
      </form>
    </section>
  );
}
