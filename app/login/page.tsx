import { BrandSymbol } from "@/components/ui/brand-art";
import { vi } from "@/lib/i18n/vi";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col gap-3 p-3 md:flex-row md:p-5">
      <section className="on-brand flex rounded-hero bg-brand px-6 py-10 text-on-brand md:w-1/2 md:items-end md:px-10 md:py-12">
        <div className="flex max-w-md flex-col gap-4">
          <BrandSymbol className="size-10" />
          <h1 className="animate-rise text-display">{vi.app.name}</h1>
          <p className="animate-rise text-lead text-on-brand-2" style={{ animationDelay: "80ms" }}>
            {vi.login.lead}
          </p>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="animate-rise flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h1">{vi.login.title}</h2>
            <p className="text-ink-2">{vi.login.intro}</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
