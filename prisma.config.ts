import { defineConfig, env } from 'prisma/config'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@localhost:5432/e_voting?schema=public',
  },
})
