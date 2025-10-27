import { sbServer } from "@/lib/supabase/server"
export async function requireUser() {
  const supabase = sbServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 })
  return user
}
