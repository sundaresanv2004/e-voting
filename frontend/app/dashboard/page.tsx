import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/login")
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/" })
        }}>
          <Button variant="destructive" type="submit">Logout</Button>
        </form>
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-4">
          <div>
            <span className="text-muted-foreground block text-sm">Name</span>
            <span className="text-foreground font-medium text-lg">{session.user.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-sm">Email</span>
            <span className="text-foreground font-medium text-lg">{session.user.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
