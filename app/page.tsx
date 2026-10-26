import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { ArrowCircle, Tile, TileLink, tileText, type TileTone } from "@/components/ui/tile";
import { getViewer } from "@/lib/auth/viewer";
import { roleLabel, vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { loadPortfolio } from "@/lib/products/load";

type Module = { href: string | null; icon: IconName; tone: TileTone; title: string; text: string };

// Mỗi mục một màu: khối màu bo lớn xếp kiểu bento. Mục chưa mở là khối nhạt, nét đứt.
const MODULES: Module[] = [
  { href: "/brand/journey", icon: "route", tone: "plum", ...vi.home.modules.journey },
  { href: "/brand/brands", icon: "diamond", tone: "lemon", ...vi.home.modules.brands },
  { href: "/brand/products", icon: "book", tone: "blush", ...vi.home.modules.products },
  { href: "/design-system", icon: "palette", tone: "lilac", ...vi.home.modules.designSystem },
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
        <section className="mx-auto w-full max-w-6xl px-4 pt-4" aria-label={vi.nav.home}>
          <div className="grid gap-3 md:grid-cols-12">
            <Tile tone="red" className="animate-rise flex flex-col justify-between gap-10 rounded-hero p-6 md:col-span-8 md:min-h-[26rem] md:p-10">
              <div className="flex flex-col items-start gap-4">
                <p className="text-small font-medium text-on-brand-2">{vi.nav.home}</p>
                <h1 className="text-mega uppercase">{vi.app.name}</h1>
                <p className="max-w-xl text-lead text-on-brand-2">{vi.app.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/brand/journey" variant="inverse" size="lg" arrow>
                  {vi.home.modules.journey.title}
                </ButtonLink>
                <Suspense fallback={<p className="text-on-brand-2">{vi.home.loading}</p>}>
                  <Account />
                </Suspense>
              </div>
            </Tile>
            <Suspense fallback={<StatsFallback />}>
              <Stats />
            </Suspense>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="text-h1 uppercase">
            {vi.home.modulesTitle}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m, i) => {
              const text = tileText(m.tone);
              return (
                <li key={m.title} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                  {m.href ? (
                    <TileLink href={m.href} tone={m.tone} className="flex h-full min-h-[18rem] flex-col gap-6 p-6">
                      <Icon name={m.icon} className="size-8" />
                      <div className="flex flex-col gap-2">
                        <h3 className="text-h2">{m.title}</h3>
                        <p className={`text-small ${text.muted}`}>{m.text}</p>
                      </div>
                      <div className="mt-auto flex justify-end">
                        <ArrowCircle tone={m.tone === "lemon" || m.tone === "blush" || m.tone === "lilac" ? "ink" : "lemon"} size="lg" />
                      </div>
                    </TileLink>
                  ) : (
                    <Tile tone={m.tone} className="flex h-full min-h-[18rem] flex-col gap-6 border border-dashed border-line-strong p-6">
                      <Icon name={m.icon} className="size-8 text-ink-3" />
                      <div className="flex flex-col gap-2">
                        <h3 className="text-h2 text-ink-2">{m.title}</h3>
                        <p className={`text-small ${text.muted}`}>{m.text}</p>
                      </div>
                      <span className="mt-auto">
                        <Badge tone="pending">{vi.home.comingSoon}</Badge>
                      </span>
                    </Tile>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}

function StatTile({ tone, value, label, href }: { tone: TileTone; value: number | string; label: string; href?: string }) {
  const text = tileText(tone);
  const body = (
    <>
      <p className="text-mega leading-none">{value}</p>
      <p className={`text-small font-medium ${text.muted}`}>{label}</p>
    </>
  );
  const cls = "flex min-h-[11rem] flex-1 flex-col justify-between gap-6 p-6";
  return href ? (
    <TileLink href={href} tone={tone} className={cls}>
      {body}
    </TileLink>
  ) : (
    <Tile tone={tone} className={cls}>
      {body}
    </Tile>
  );
}

function StatsFallback() {
  return (
    <div className="flex flex-col gap-3 md:col-span-4" aria-hidden>
      <Tile tone="lemon" className="min-h-[11rem] flex-1" />
      <Tile tone="plum" className="min-h-[11rem] flex-1" />
    </div>
  );
}

// Các con số lấy thẳng từ dữ liệu đang hiển thị cho người xem; lỗi đọc dữ liệu thì bỏ khối, không chặn trang chủ.
// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function loadCounts(): Promise<{ products: number; brands: number; nodes: number } | null> {
  try {
    const [map, portfolio] = await Promise.all([loadJourneyMap(), loadPortfolio()]);
    return {
      products: portfolio.products.length,
      brands: portfolio.brands.length,
      nodes: map.nodes.filter((n) => n.kind !== "gap_note" && n.kind !== "branch_label").length,
    };
  } catch {
    return null;
  }
}

async function Stats() {
  const counts = await loadCounts();
  if (!counts) return <StatsFallback />;
  return (
    <div className="animate-rise flex flex-col gap-3 md:col-span-4" style={{ animationDelay: "80ms" }}>
      <StatTile tone="lemon" value={counts.products} label="sản phẩm trong danh mục" href="/brand/products" />
      <StatTile tone="plum" value={counts.brands} label="thương hiệu" href="/brand/brands" />
      <StatTile tone="blush" value={counts.nodes} label="ô trên bản đồ hành trình" href="/brand/journey" />
    </div>
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
