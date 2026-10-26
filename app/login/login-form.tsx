"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { vi } from "@/lib/i18n/vi";
import { signIn, type LoginState } from "./actions";

const inputClass =
  "min-h-12 w-full rounded-full border border-line-strong bg-paper px-5 text-body text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-brand";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="pl-2 text-small font-medium">{vi.login.email}</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="pl-2 text-small font-medium">{vi.login.password}</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-small text-brand">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} arrow={!pending}>
        {pending ? vi.login.pending : vi.login.submit}
      </Button>
    </form>
  );
}
