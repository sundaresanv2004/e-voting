# Supabase Setup Guide

This guide will walk you through setting up Supabase for the e-voting application.

## Prerequisites

- Node.js and npm installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to your project repository

## Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - Project name (e.g., "e-voting")
   - Database password (save this securely!)
   - Region (choose closest to your users)
4. Click "Create new project"
5. Wait for your project to be provisioned (this may take a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (⚙️)
2. Navigate to **API** section
3. You'll need two values:
   - **Project URL**: Found under "Project URL"
   - **Anon/Public Key**: Found under "Project API keys" → "anon public"

> **Note**: Supabase is transitioning to "publishable" keys (starting with `sb_publishable_`). You can use either the legacy `anon` key or the new publishable key.

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

## Step 4: Install Dependencies

The required Supabase packages should already be in `package.json`. Install them with:

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Core Supabase client
- `@supabase/ssr` - Server-side rendering utilities for Next.js

## Step 5: Verify Setup

Create a test page to verify your Supabase connection:

1. Create `app/test-supabase/page.tsx`:
   ```tsx
   import { createClient } from '@/lib/supabase/server'
   
   export default async function TestSupabase() {
     const supabase = await createClient()
     
     // Test connection by getting current timestamp from database
     const { data, error } = await supabase
       .from('_health')
       .select('*')
       .limit(1)
     
     if (error) {
       return (
         <div className="p-8">
           <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
           <p className="text-red-600">Error: {error.message}</p>
           <p className="text-sm mt-2">
             This is expected if you haven't created any tables yet.
           </p>
         </div>
       )
     }
     
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
         <p className="text-green-600">✓ Successfully connected to Supabase!</p>
         <p className="text-sm mt-2">Database URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
       </div>
     )
   }
   ```

2. Run your development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000/test-supabase` in your browser

## Usage Examples

### Server Component (Recommended for data fetching)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  
  const { data: elections, error } = await supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching elections:', error)
    return <div>Error loading elections</div>
  }
  
  return (
    <div>
      <h1>Elections</h1>
      <ul>
        {elections?.map((election) => (
          <li key={election.id}>{election.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Client Component (For interactive features)

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyClientComponent() {
  const [data, setData] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('elections').select()
      setData(data)
    }
    fetchData()
  }, [])
  
  return <div>{JSON.stringify(data)}</div>
}
```

### Server Action (For mutations)

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createElection(formData: FormData) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('elections')
    .insert({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/elections')
  return { data }
}
```

## Authentication Setup (Optional)

To add authentication to your application:

### 1. Enable Authentication Providers

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable desired providers (Email, Google, GitHub, etc.)
3. Configure each provider with required credentials

### 2. Add Middleware for Route Protection

Create `middleware.ts` in your project root:

```tsx
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 3. Protect Routes

Modify `lib/supabase/middleware.ts` to add route protection:

```tsx
// Inside the updateSession function, after getting the user:
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}
```

## Database Schema

### Creating Tables

1. Go to your Supabase dashboard → **SQL Editor**
2. Create a new query
3. Example schema for e-voting:

```sql
-- Create elections table
CREATE TABLE elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(election_id, voter_id) -- One vote per user per election
);

-- Enable Row Level Security
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Elections are viewable by everyone" 
  ON elections FOR SELECT 
  USING (true);

CREATE POLICY "Candidates are viewable by everyone" 
  ON candidates FOR SELECT 
  USING (true);

CREATE POLICY "Users can vote" 
  ON votes FOR INSERT 
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view their own votes" 
  ON votes FOR SELECT 
  USING (auth.uid() = voter_id);
```

### Generate TypeScript Types

After creating your database schema, generate TypeScript types:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Generate types (replace YOUR_PROJECT_ID with your actual project ID)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

Your project ID can be found in your project URL: `https://YOUR_PROJECT_ID.supabase.co`

## Storage Setup (For File Uploads)

If you need to handle file uploads (e.g., candidate images):

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket (e.g., "candidate-images")
3. Configure bucket policies for public/private access
4. Use the Supabase client to upload files:

```tsx
const { data, error } = await supabase.storage
  .from('candidate-images')
  .upload('path/to/file.jpg', file)
```

## Best Practices

1. **Row Level Security (RLS)**: Always enable RLS on tables containing sensitive data
2. **Server Components**: Prefer Server Components for data fetching to reduce client bundle size
3. **Error Handling**: Always handle errors from Supabase queries
4. **Type Safety**: Generate and use TypeScript types for better developer experience
5. **Environment Variables**: Never commit `.env.local` to version control
6. **Client vs Server**: Use server client for sensitive operations, client for real-time subscriptions

## Troubleshooting

### "Failed to fetch" errors
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active (not paused)
- Ensure you're using `NEXT_PUBLIC_` prefix for client-side variables

### Authentication issues
- Verify middleware is properly configured
- Check that RLS policies allow the operation
- Verify user session is valid using `supabase.auth.getUser()`

### TypeScript errors
- Regenerate types after schema changes
- Ensure `@supabase/supabase-js` version matches your type generation

## Next Steps

1. **Create your database schema** using the SQL Editor
2. **Generate TypeScript types** from your schema
3. **Set up authentication** if needed
4. **Create your application pages** using the Supabase clients
5. **Deploy** your application (Vercel, Netlify, etc.)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
