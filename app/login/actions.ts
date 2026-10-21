"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { vi } from "@/lib/i18n/vi";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: vi.login.invalidForm };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: vi.login.invalid };

  redirect("/");
}
