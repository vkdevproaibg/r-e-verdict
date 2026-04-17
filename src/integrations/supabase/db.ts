// Device-scoped Supabase client: injects x-device-id header for RLS.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getDeviceId } from "@/lib/device";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const db = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
  global: {
    headers: {
      "x-device-id": getDeviceId(),
    },
  },
});
