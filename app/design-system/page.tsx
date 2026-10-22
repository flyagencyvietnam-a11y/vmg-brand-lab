import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { BrandSymbol, Ornament, PatternLayer } from "@/components/ui/brand-art";
import { Hero } from "@/components/ui/hero";
import { ICON_NAMES, Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { contrastRatio } from "@/lib/design/contrast";
import {
  avoidPairs,
  contrastPairs,
  goldScale,
  inkScale,
  redScale,
  roleHex,
  roles,
  type Provenance,
  type Swatch,
} from "@/lib/design/tokens";
import { ds } from "@/lib/i18n/design-system";
import { vi } from "@/lib/i18n/vi";

export const metadata: Metadata = { title: `${ds.title} · ${vi.app.name}` };

const SECTION_IDS = ["principles", "colour", "type", "art", "components", "rules", "sources"] as const;

const TYPE_SCALE = [
  { cls: "text-display font-bold uppercase", name: "Display", spec: "36 đến 60 px · Bold · IN HOA", sample: "Hành trình" },
  { cls: "text-h1 font-bold", name: "H1", spec: "28 đến 40 px · Bold", sample: ds.type.sample },
  { cls: "text-h2 font-bold", name: "H2", spec: "24 px · Bold", sample: ds.type.sample },
  { cls: "text-h3 font-bold", name: "H3", spec: "18 px · Bold", sample: ds.type.sample },
  { cls: "text-body", name: "Body", spec: "16 px · Regular · dòng 1,65", sample: "Một học viên VMG đi qua những sản phẩm nào theo từng độ tuổi." },
  { cls: "text-small font-semibold", name: "Small", spec: "14 px · SemiBold", sample: ds.type.sample },
  { cls: "text-caption", name: "Caption", spec: "12 px · Regular", sample: "Chú thích, không dùng cho thông tin quan trọng" },
] as const;

const BADGES = [
  ["neutral", ds.components.badgeLabels.neutral],
  ["pending", ds.components.badgeLabels.pending],
  ["gold", ds.components.badgeLabels.gold],
  ["brand", ds.components.badgeLabels.brand],
] as const;

function SourceBadge({ source }: { source: Provenance }) {
  return <Badge tone={source === "official" ? "brand" : source === "measured" ? "neutral" : "pending"}>{ds.colour.source[source]}</Badge>;
}

function SwatchRow({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <div>
      <h4 className="mb-3 text-small font-bold uppercase tracking-caps text-gold">{title}</h4>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <li key={s.token} className="overflow-hidden rounded-card border border-line bg-paper">
            <div className="h-16 border-b border-line" style={{ backgroundColor: s.hex }} aria-hidden />
            <div className="flex flex-col gap-1 p-3">
              <p className="font-semibold">{s.label}</p>
              <p className="text-small text-ink-2">
                <code>{s.hex}</code>
              </p>
              <p className="text-caption text-ink-3">
                <code>{s.token}</code>
              </p>
              {s.note ? <p className="text-small text-ink-2">{s.note}</p> : null}
              <div className="pt-1">
                <SourceBadge source={s.source} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrimaryColour({ c, hex }: { c: { name: string; pantone: string; cmyk: string; rgb: string; hex: string }; hex: string }) {
  return (
    <li className="overflow-hidden rounded-card border border-line bg-paper">
      <div className="on-brand flex h-32 items-end p-5 text-on-brand" style={{ backgroundColor: hex }}>
        <p className="text-h2 font-bold uppercase">{c.pantone}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-5 text-small">
        <dt className="text-ink-3">{c.name}</dt>
        <dd className="font-semibold">{c.pantone}</dd>
        <dt className="text-ink-3">CMYK</dt>
        <dd>{c.cmyk}</dd>
        <dt className="text-ink-3">RGB</dt>
        <dd>{c.rgb.replace("RGB ", "")}</dd>
        <dt className="text-ink-3">HEX</dt>
        <dd>
          <code>{c.hex}</code>
        </dd>
      </dl>
    </li>
  );
}

export default function DesignSystemPage() {
  const c = ds.colour;
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Hero eyebrow={ds.eyebrow} title={ds.title} lead={ds.lead}>
          <nav aria-label={ds.toc} className="mt-2">
            <ul className="flex flex-wrap gap-2">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-11 items-center rounded-ctl border border-white/50 px-4 text-small font-semibold hover:bg-white/10"
                  >
                    {ds.sections[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Hero>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-14">
          {/* Nguyên tắc */}
          <section id="principles" aria-labelledby="h-principles" className="flex flex-col gap-6">
            <SectionHeading id="h-principles" title={ds.sections.principles} />
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ds.principles.map((p, i) => (
                <li key={p.title}>
                  <Card className="flex h-full flex-col gap-2 p-5">
                    <span className="text-small font-bold tracking-caps text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-h3 font-bold">{p.title}</h3>
                    <p className="text-ink-2">{p.text}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          {/* Màu sắc */}
          <section id="colour" aria-labelledby="h-colour" className="flex flex-col gap-10">
            <SectionHeading id="h-colour" title={ds.sections.colour} lead={c.officialLead} />
            <ul className="grid gap-4 md:grid-cols-2">
              <PrimaryColour c={c.red} hex={roleHex.brand!} />
              <PrimaryColour c={c.gold} hex={roleHex.gold!} />
            </ul>

            <div className="flex flex-col gap-6">
              <SectionHeading level={3} title={c.scales} lead={c.scalesLead} />
              <SwatchRow title="Đỏ" items={redScale} />
              <SwatchRow title="Vàng đồng và nền" items={goldScale} />
              <SwatchRow title="Mực và đường kẻ" items={inkScale} />
            </div>

            <div className="flex flex-col gap-6">
              <SectionHeading level={3} title={c.roles} lead={c.rolesLead} />
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((r) => (
                  <li key={r.name} className="flex items-start gap-3 rounded-card border border-line bg-paper p-3">
                    <span
                      aria-hidden
                      className="mt-0.5 size-10 shrink-0 rounded-ctl border border-line-strong"
                      style={{ backgroundColor: roleHex[r.name] }}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        <code>{r.name}</code>
                      </span>
                      <span className="block text-small text-ink-2">{r.usage}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={c.proportion} lead={c.proportionLead} />
              <div className="flex h-14 overflow-hidden rounded-card border border-line" role="img" aria-label={c.proportionItems.map((i) => `${i.label} ${i.value}%`).join(", ")}>
                {c.proportionItems.map((i) => (
                  <div key={i.label} style={{ width: `${i.value}%`, backgroundColor: i.colour }} />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-1 text-small text-ink-2">
                {c.proportionItems.map((i) => (
                  <li key={i.label}>
                    <span aria-hidden className="mr-2 inline-block size-3 rounded-full align-middle" style={{ backgroundColor: i.colour }} />
                    {i.label} {i.value}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={c.contrast} lead={c.contrastLead} />
              <div className="overflow-x-auto rounded-card border border-line bg-paper">
                <table className="w-full min-w-[34rem] text-left text-small">
                  <thead className="bg-sunken text-ink-2">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{c.colText.pair}</th>
                      <th className="px-4 py-3 font-semibold">{c.colText.ratio}</th>
                      <th className="px-4 py-3 font-semibold">{c.colText.use}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contrastPairs.map((p) => {
                      const ratio = contrastRatio(roleHex[p.fg]!, roleHex[p.bg]!);
                      return (
                        <tr key={`${p.fg}-${p.bg}`} className="border-t border-line">
                          <td className="px-4 py-2">
                            <span
                              className="inline-flex min-h-9 items-center rounded-ctl border border-line px-3 font-semibold"
                              style={{ color: roleHex[p.fg], backgroundColor: roleHex[p.bg] }}
                            >
                              Aa · {p.fg} / {p.bg}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {ratio.toFixed(1).replace(".", ",")}:1 <Badge tone="brand">{c.pass}</Badge>
                          </td>
                          <td className="px-4 py-2 text-ink-2">{p.use}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Card className="flex flex-col gap-3 bg-sunken p-5">
                <h4 className="font-bold">{c.avoid}</h4>
                <p className="text-ink-2">{c.avoidLead}</p>
                <ul className="flex flex-col gap-2">
                  {avoidPairs.map((p) => (
                    <li key={`${p.fg}-${p.bg}`} className="flex flex-wrap items-center gap-3 text-small">
                      <span
                        className="inline-flex min-h-9 items-center rounded-ctl border border-line px-3 font-semibold"
                        style={{ color: roleHex[p.fg], backgroundColor: roleHex[p.bg] }}
                      >
                        {p.fg} / {p.bg}
                      </span>
                      <span className="font-semibold">{contrastRatio(roleHex[p.fg]!, roleHex[p.bg]!).toFixed(1).replace(".", ",")}:1</span>
                      <span className="text-ink-2">{p.why}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* Chữ */}
          <section id="type" aria-labelledby="h-type" className="flex flex-col gap-8">
            <SectionHeading id="h-type" title={ds.sections.type} lead={ds.type.faceLead} />
            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
              <Card className="flex flex-col gap-2 p-6">
                <p className="text-[6rem] leading-none font-bold text-brand">Aa</p>
                <p className="text-h3 font-bold">Montserrat Variable</p>
                <p className="text-ink-2">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                  <br />
                  ÀÁẢÃẠ ĂẰẮ ÂẦẤ ĐÈÉ ÔỒỐ ƠỜỚ ƯỪỨ 0123456789
                </p>
              </Card>
              <Card className="flex flex-col gap-3 p-6">
                <h3 className="text-h3 font-bold">{ds.type.weights}</h3>
                <ul className="flex flex-col gap-3">
                  {ds.type.weightItems.map((w, i) => (
                    <li key={w.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-b-0">
                      <span className="text-h3" style={{ fontWeight: [700, 600, 500, 400][i] }}>
                        {w.name}
                      </span>
                      <span className="text-small text-ink-2">{w.use}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={ds.type.scale} />
              <ul className="flex flex-col rounded-card border border-line bg-paper">
                {TYPE_SCALE.map((t) => (
                  <li key={t.name} className="grid gap-2 border-b border-line p-5 last:border-b-0 md:grid-cols-[10rem_1fr] md:gap-6">
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-small text-ink-2">{t.spec}</p>
                      <p className="text-caption text-ink-3">
                        <code>{t.cls.split(" ")[0]}</code>
                      </p>
                    </div>
                    <p className={t.cls}>{t.sample}</p>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="flex flex-col gap-2">
              {ds.type.rules.map((r) => (
                <li key={r} className="flex gap-3">
                  <Icon name="check" className="mt-1 size-5 shrink-0 text-brand" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Biểu tượng và họa tiết */}
          <section id="art" aria-labelledby="h-art" className="flex flex-col gap-8">
            <SectionHeading id="h-art" title={ds.sections.art} lead={ds.art.symbolText} />
            <ul className="grid gap-4 md:grid-cols-3">
              <li>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="flex h-40 items-center justify-center rounded-ctl bg-surface">
                    <BrandSymbol className="size-24" />
                  </div>
                  <h3 className="font-bold">{ds.art.symbol}</h3>
                </Card>
              </li>
              <li>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="on-brand relative isolate h-40 overflow-hidden rounded-ctl bg-brand">
                    <Ornament />
                  </div>
                  <h3 className="font-bold">{ds.art.ornament}</h3>
                  <p className="text-small text-ink-2">{ds.art.ornamentText}</p>
                </Card>
              </li>
              <li>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="relative isolate h-40 overflow-hidden rounded-ctl bg-brand">
                    <PatternLayer />
                  </div>
                  <h3 className="font-bold">{ds.art.pattern}</h3>
                  <p className="text-small text-ink-2">{ds.art.patternText}</p>
                </Card>
              </li>
            </ul>
            <p className="flex gap-3 rounded-card border border-dashed border-line-strong bg-sunken p-4 text-small text-ink-2">
              <Icon name="info" className="mt-0.5 size-5 shrink-0" />
              {ds.art.logoNote}
            </p>
          </section>

          {/* Thành phần */}
          <section id="components" aria-labelledby="h-components" className="flex flex-col gap-10">
            <SectionHeading id="h-components" title={ds.sections.components} lead={ds.components.touch} />

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={ds.components.buttons} />
              <div className="flex flex-wrap items-center gap-3">
                <Button>{ds.components.buttonLabels.primary}</Button>
                <Button variant="secondary">{ds.components.buttonLabels.secondary}</Button>
                <Button variant="ghost">{ds.components.buttonLabels.ghost}</Button>
                <Button disabled>{ds.components.buttonLabels.disabled}</Button>
                <ButtonLink href="/brand/journey" variant="secondary">
                  {vi.nav.brand} <Icon name="arrow-right" className="size-4" />
                </ButtonLink>
                <span className="on-brand inline-flex rounded-card bg-brand p-3">
                  <Button variant="inverse">{ds.components.buttonLabels.inverse}</Button>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={ds.components.badges} />
              <div className="flex flex-wrap items-center gap-3">
                {BADGES.map(([tone, label]) => (
                  <Badge key={tone} tone={tone}>
                    {label}
                  </Badge>
                ))}
                <span className="on-brand inline-flex rounded-card bg-brand p-3">
                  <Badge tone="on-brand">{ds.components.badgeLabels.onBrand}</Badge>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={ds.components.cards} />
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                  <h4 className="text-h3 font-bold">{ds.components.cardSample.title}</h4>
                  <p className="mt-1 text-ink-2">{ds.components.cardSample.text}</p>
                </Card>
                <CardLink href="#components" className="p-5">
                  <h4 className="text-h3 font-bold">{ds.components.cardLinkSample.title}</h4>
                  <p className="mt-1 text-ink-2">{ds.components.cardLinkSample.text}</p>
                </CardLink>
              </div>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <SectionHeading level={3} title={ds.components.steps} />
                <Card className="p-6">
                  <ol className="flex flex-col">
                    {ds.components.stepSample.map((label, i, all) => {
                      const exam = i === 2;
                      const number = exam ? null : all.slice(0, i + 1).filter((_, j) => j !== 2).length;
                      return (
                        <li key={label} className="relative pb-6 pl-12 last:pb-0">
                          {i < all.length - 1 ? <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-0.5 bg-line-strong" /> : null}
                          {exam ? (
                            <span aria-hidden className="absolute left-[5px] top-1 size-[18px] rotate-45 rounded-[3px] border-2 border-gold-mark bg-paper" />
                          ) : (
                            <span aria-hidden className="absolute left-0 top-0.5 flex size-7 items-center justify-center rounded-full bg-brand text-small font-bold text-on-brand">
                              {number}
                            </span>
                          )}
                          <p className="font-bold">{label}</p>
                          <p className="text-small text-ink-2">8 đến 12 tháng</p>
                        </li>
                      );
                    })}
                  </ol>
                </Card>
              </div>
              <div className="flex flex-col gap-4">
                <SectionHeading level={3} title={ds.components.fields} />
                <Card className="p-6">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-small font-semibold">{ds.components.fieldLabel}</span>
                    <input
                      type="email"
                      placeholder={ds.components.fieldPlaceholder}
                      className="min-h-12 w-full rounded-ctl border border-line-strong bg-paper px-4 text-body placeholder:text-ink-3 hover:border-ink-3"
                    />
                  </label>
                </Card>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeading level={3} title={ds.components.icons} lead={ds.components.iconsText} />
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {ICON_NAMES.map((name) => (
                  <li key={name} className="flex flex-col items-center gap-2 rounded-card border border-line bg-paper p-3 text-brand">
                    <Icon name={name} className="size-7" />
                    <code className="text-caption text-ink-2">{name}</code>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Nên và không nên */}
          <section id="rules" aria-labelledby="h-rules" className="flex flex-col gap-6">
            <SectionHeading id="h-rules" title={ds.sections.rules} lead={ds.rules.cobranding} />
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="flex items-center gap-2 text-h3 font-bold text-brand">
                  <Icon name="check" className="size-5" />
                  {ds.rules.doTitle}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {ds.rules.dos.map((r) => (
                    <li key={r} className="flex gap-3">
                      <Icon name="check" className="mt-1 size-4 shrink-0 text-brand" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="bg-sunken p-6">
                <h3 className="flex items-center gap-2 text-h3 font-bold text-ink">
                  <span aria-hidden className="text-h3 leading-none">
                    ✕
                  </span>
                  {ds.rules.dontTitle}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {ds.rules.donts.map((r) => (
                    <li key={r} className="flex gap-3">
                      <span aria-hidden className="mt-0.5 shrink-0 text-ink-3">
                        ✕
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* Nguồn */}
          <section id="sources" aria-labelledby="h-sources" className="flex flex-col gap-6">
            <SectionHeading id="h-sources" title={ds.sections.sources} />
            <div className="grid gap-6 md:grid-cols-2">
              <ul className="flex flex-col gap-3">
                {ds.sources.items.map((s) => (
                  <li key={s} className="flex gap-3 text-ink-2">
                    <Icon name="book" className="mt-1 size-4 shrink-0 text-gold" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <Card className="bg-sunken p-5">
                <h3 className="font-bold">{ds.sources.openTitle}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {ds.sources.open.map((s) => (
                    <li key={s} className="flex gap-3 text-ink-2">
                      <Icon name="info" className="mt-1 size-4 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
