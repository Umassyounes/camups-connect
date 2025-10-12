import { redirect } from "next/navigation"
import { sbServer } from "@/lib/supabase/server"
import ListingForm from "@/components/ListingForm"

export default async function NewListingPage() {
  const supabase = sbServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">Post a listing</h1>
      <ListingForm />
    </div>
  )
}
