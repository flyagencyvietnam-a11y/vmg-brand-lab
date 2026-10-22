import { BrandSymbol, Ornament, PatternLayer } from "@/components/ui/brand-art";
import { vi } from "@/lib/i18n/vi";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col md:flex-row">
      <section className="on-brand relative isolate flex overflow-hidden bg-brand px-6 py-12 text-on-brand md:w-1/2 md:items-end md:px-12 md:py-16">
        <PatternLayer />
        <Ornament />
        <div className="relative flex max-w-md flex-col gap-5">
          <BrandSymbol className="size-14" />
          <h1 className="text-display font-bold uppercase">{vi.app.name}</h1>
          <p className="text-h3 text-on-brand-2">{vi.login.lead}</p>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div>
            <span aria-hidden className="mb-3 block h-0.5 w-10 bg-gold-mark" />
            <h2 className="text-h1 font-bold">{vi.login.title}</h2>
            <p className="mt-2 text-ink-2">{vi.login.intro}</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
