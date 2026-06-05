import { defineConfig, env } from 'prisma/config'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'myuser'}:${process.env.POSTGRES_PASSWORD || 'mypassword'}@localhost:5432/${process.env.POSTGRES_DB || 'e_voting'}?schema=public`,
  },
})
