import { supabase } from "@/lib/supabaseClient";

export type BizPlusRole = "owner" | "staff";

// This app's UI uses phone + PIN, but Supabase Auth is simplest with email+password.
// We deterministically map phone -> email alias so the UI can stay phone-first.
export function phoneToEmailAlias(phone: string) {
  const normalized = phone.replace(/\s+/g, "").replace(/^\+/, "");
  return `${normalized}@bizplus.local`;
}

export async function signUpWithPhonePin(params: {
  phone: string;
  pin: string;
  role: BizPlusRole;
}) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud accounts.",
    );
  }
  const email = phoneToEmailAlias(params.phone);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: params.pin,
    options: {
      data: {
        phone: params.phone,
        role: params.role,
      },
    },
  });

  if (error) throw error;

  // Create a profile row in Postgres (requires you to create the table + RLS policy).
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        phone: params.phone,
        role: params.role,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (profileError) throw profileError;
  }

  return data;
}

export async function signInWithPhonePin(params: { phone: string; pin: string }) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud login.",
    );
  }
  const email = phoneToEmailAlias(params.phone);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: params.pin,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

