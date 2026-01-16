import { cache } from "react";
import { createClient } from "./server";

/**
 * Cached version of supabase.auth.getUser()
 *
 * React.cache() deduplicates calls within a single request,
 * so multiple components calling getCachedUser() will only
 * make one actual auth call to Supabase.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
