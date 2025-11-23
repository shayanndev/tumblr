# tumblR - Secure Group Chat Application

A lightweight, secure chat application built with Next.js and Supabase, designed for small groups (20-30 people). Features include real-time messaging, direct messages, group chats, online status, and admin controls.

## Features

- 🔐 **Secure Authentication** - Login and registration with Supabase Auth
- 💬 **Real-time Chat** - Direct messages and group chats
- 👥 **Online Status** - See who's online in real-time
- 🎭 **Admin Controls** - Only admins can create groups and add members
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Minimal UI** - Clean and simple interface
- 📝 **Message Types** - Text, emoji, and voice messages
- 🚪 **Leave Groups** - Users can leave groups they're in

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Database, authentication, and real-time subscriptions
- **Tailwind CSS** - Styling
- **Vercel** - Hosting (free tier compatible)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to get your project URL and anon key
4. Go to SQL Editor and run the SQL from `supabase-schema.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Admin User

After creating your account, you need to make yourself an admin. Run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Security Features

- Row Level Security (RLS) policies on all tables
- Secure authentication with Supabase Auth
- Users can only see messages they're part of
- Only admins can create groups and add members
- Input validation and sanitization

## Database Schema

- **profiles** - User profiles with online status
- **groups** - Chat groups created by admins
- **group_members** - Many-to-many relationship between users and groups
- **messages** - All chat messages (DMs and group messages)

## Project Structure

```
tumblR/
├── app/
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── page.tsx        # Main chat app
│   └── layout.tsx      # Root layout
├── components/
│   ├── ChatApp.tsx     # Main chat application component
│   ├── Sidebar.tsx     # Sidebar with users and groups
│   └── ChatWindow.tsx  # Chat window component
├── lib/
│   └── supabase/       # Supabase client utilities
└── supabase-schema.sql # Database schema
```

## Notes

- Voice messages are currently a placeholder (shows emoji indicator)
- The app is optimized for Vercel's free tier limits
- All data is stored in Supabase (free tier: 500MB database, 2GB bandwidth)
- Real-time features use Supabase's real-time subscriptions

## License

MIT

