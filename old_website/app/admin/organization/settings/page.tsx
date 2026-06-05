import { getOrganizationData } from "./_actions"
import SettingsHero from "./_components/SettingsHero"
import { SettingsContainer } from "./_components/SettingsContainer"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

export default async function OrganizationSettingsPage() {
  const organization = await getOrganizationData()

  if (!organization) {
    redirect("/admin/organization/no-access")
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <SettingsHero />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
          <SettingsContainer
            organization={{
              id: organization.id,
              name: organization.name,
              type: organization.type,
              code: organization.code,
              ownerId: organization.ownerId,
              logo: organization.logo,
              settings: organization.settings
                ? {
                    allowSystemConnection: organization.settings.allowSystemConnection,
                    maxSystems: organization.settings.maxSystems,
                  }
                : null,
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}
