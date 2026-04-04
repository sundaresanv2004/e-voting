import { getOrganizationData } from "./_actions"
import SettingsHero from "./_components/SettingsHero"
import { OrganizationProfileForm } from "./_components/OrganizationProfileForm"
import { OrganizationSettingsForm } from "./_components/OrganizationSettingsForm"
import { Separator } from "@/components/ui/separator"
import { redirect } from "next/navigation"

export default async function OrganizationSettingsPage() {
  const organization = await getOrganizationData()

  if (!organization) {
    redirect("/admin/organization/no-access")
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/5">
      <SettingsHero />
      
      <div className="flex-1 py-8 px-4 md:px-8 max-w-5xl w-full mx-auto space-y-10">
        <section className="space-y-6">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl font-semibold tracking-tight">Organization Profile</h2>
            <p className="text-sm text-muted-foreground">Manage your organization's core identity and branding.</p>
          </div>
          <OrganizationProfileForm 
            initialData={{
              name: organization.name,
              type: organization.type,
              code: organization.code,
              logo: organization.logo
            }} 
          />
        </section>

        <Separator className="my-12 bg-border/40" />

        <section className="space-y-6">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl font-semibold tracking-tight">Advanced Settings</h2>
            <p className="text-sm text-muted-foreground">Configure technical constraints and security policies.</p>
          </div>
          {organization.settings && (
            <OrganizationSettingsForm 
              initialData={{
                allowSystemRegistration: organization.settings.allowSystemRegistration,
                maxSystems: organization.settings.maxSystems,
              }} 
            />
          )}
        </section>

        <div className="py-10 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
              Organization System ID: {organization.id}
            </p>
        </div>
      </div>
    </div>
  )
}
