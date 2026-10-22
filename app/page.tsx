import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { Hero } from "@/components/ui/hero";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { getViewer } from "@/lib/auth/viewer";
import { roleLabel, vi } from "@/lib/i18n/vi";

const MODULES: { href: string | null; icon: IconName; title: string; text: string }[] = [
  { href: "/brand/journey", icon: "route", ...vi.home.modules.journey },
  { href: "/design-system", icon: "palette", ...vi.home.modules.designSystem },
  { href: null, icon: "book", ...vi.home.modules.guidelines },
  { href: null, icon: "lock", ...vi.home.modules.library },
  { href: null, icon: "lock", ...vi.home.modules.plan },
  { href: null, icon: "lock", ...vi.home.modules.studio },
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
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <li key={m.title}>
                {m.href ? (
                  <CardLink href={m.href} className="group flex h-full flex-col gap-3 p-5">
                    <ModuleBody icon={m.icon} title={m.title} text={m.text} />
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-semibold text-brand">
                      {vi.journey.viewDetail}
                      <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardLink>
                ) : (
                  <Card className="flex h-full flex-col gap-3 bg-sunken p-5">
                    <ModuleBody icon={m.icon} title={m.title} text={m.text} muted />
                    <span className="mt-auto pt-2">
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

function ModuleBody({ icon, title, text, muted = false }: { icon: IconName; title: string; text: string; muted?: boolean }) {
  return (
    <>
      <span
        className={`flex size-11 items-center justify-center rounded-ctl ${muted ? "bg-paper text-ink-3" : "bg-brand-soft text-brand"}`}
      >
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="text-h3 font-bold">{title}</h3>
      <p className="text-ink-2">{text}</p>
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
        <Icon name="user" className="size-4" />
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
