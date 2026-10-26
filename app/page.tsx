import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardLink, type CardTone } from "@/components/ui/card";
import { Hero } from "@/components/ui/hero";
import { Icon, type IconName } from "@/components/ui/icon";
import { IconBubble } from "@/components/ui/icon-bubble";
import { SectionHeading } from "@/components/ui/section-heading";
import { getViewer } from "@/lib/auth/viewer";
import { roleLabel, vi } from "@/lib/i18n/vi";

type Module = { href: string | null; icon: IconName; tone: CardTone; title: string; text: string };

const MODULES: Module[] = [
  { href: "/brand/journey", icon: "route", tone: "paper", ...vi.home.modules.journey },
  { href: "/design-system", icon: "palette", tone: "paper", ...vi.home.modules.designSystem },
  { href: null, icon: "book", tone: "cream", ...vi.home.modules.guidelines },
  { href: null, icon: "lock", tone: "cream", ...vi.home.modules.library },
  { href: null, icon: "lock", tone: "cream", ...vi.home.modules.plan },
  { href: null, icon: "lock", tone: "cream", ...vi.home.modules.studio },
];

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Hero eyebrow={vi.nav.home} title={vi.app.name} lead={vi.app.description}>
          <Suspense fallback={<p className="text-on-brand-2">{vi.home.loading}</p>}>
            <Account />
          </Suspense>
        </Hero>

        <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="modules-heading">
          <SectionHeading id="modules-heading" title={vi.home.modulesTitle} />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <li key={m.title} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                {m.href ? (
                  <CardLink href={m.href} tone={m.tone} className="group flex h-full flex-col gap-3 p-5">
                    <IconBubble name={m.icon} />
                    <h3 className="text-h3">{m.title}</h3>
                    <p className="text-ink-2">{m.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-small font-medium text-brand">
                      {vi.journey.viewDetail}
                      <Icon name="arrow-right" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </CardLink>
                ) : (
                  <Card tone={m.tone} className="flex h-full flex-col gap-3 border-dashed p-5">
                    <IconBubble name={m.icon} tone="paper" />
                    <h3 className="text-h3 text-ink-2">{m.title}</h3>
                    <p className="text-ink-2">{m.text}</p>
                    <span className="mt-auto pt-1">
                      <Badge tone="pending">{vi.home.comingSoon}</Badge>
                    </span>
                  </Card>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

// Đọc phiên (cookies) lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Account() {
  const viewer = await getViewer();
  if (!viewer) return <p className="text-on-brand-2">{vi.home.noProfile}</p>;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="on-brand">
        <Icon name="user" className="mt-0.5 size-4 shrink-0" />
        {viewer.fullName} · {roleLabel(viewer.role)}
      </Badge>
      {viewer.devSeed ? null : (
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="inverse">
            {vi.home.signOut}
          </Button>
        </form>
      )}
    </div>
  );
}
