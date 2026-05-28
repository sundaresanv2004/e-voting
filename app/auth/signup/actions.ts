"use server"

import { db } from "@/lib/db"

export async function checkEmailExists(email: string) {
    const user = await db.user.findUnique({
        where: { email: email.toLowerCase() }
    })
    
    return !!user
}
