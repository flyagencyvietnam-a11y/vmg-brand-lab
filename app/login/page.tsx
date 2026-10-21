import { vi } from "@/lib/i18n/vi";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-vmg-red">{vi.app.name}</h1>
        <p className="text-vmg-muted">{vi.login.intro}</p>
      </div>
      <LoginForm />
    </main>
  );
}
