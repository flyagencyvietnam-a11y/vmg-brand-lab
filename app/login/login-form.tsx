"use client";

import { useActionState } from "react";
import { vi } from "@/lib/i18n/vi";
import { signIn, type LoginState } from "./actions";

const inputClass =
  "min-h-11 w-full rounded-md border border-vmg-faint bg-surface-card px-3 text-base focus:outline-2 focus:outline-vmg-red";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">{vi.login.email}</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">{vi.login.password}</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error ? (
        <p role="alert" className="text-vmg-red">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-md bg-vmg-red px-4 font-bold text-white disabled:opacity-60"
      >
        {pending ? vi.login.pending : vi.login.submit}
      </button>
    </form>
  );
}
