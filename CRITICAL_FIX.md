# 🔴 CRITICAL FIX REQUIRED - Run This SQL in Supabase

## Problem
Your app has infinite recursion errors in the RLS (Row Level Security) policies, causing:
- ❌ Groups cannot be created (500 error)
- ❌ Group members cannot be loaded (500 error)  
- ❌ Messages not showing (400 error)
- ❌ Users not appearing in sidebar

## Solution
You **MUST** run the SQL fix in your Supabase project to resolve these issues.

### Steps:

1. **Go to your Supabase project dashboard**
   - Navigate to **SQL Editor**

2. **Copy and paste the ENTIRE contents of `supabase-schema-fix.sql`**

3. **Click "Run"** (or press Ctrl+Enter)

4. **Verify the fix worked:**
   - Go to **Database** → **Functions**
   - You should see `user_is_group_member` function
   - Go to **Database** → **Tables** → **group_members** → **Policies**
   - You should see the updated "Users can view members of their groups" policy

5. **Test your app:**
   - Try creating a group (should work now)
   - Try sending messages (should appear)
   - Check if users appear in sidebar

## What This Fix Does:

1. **Creates a SECURITY DEFINER function** (`user_is_group_member`) that bypasses RLS to check group membership without recursion
2. **Fixes the group_members SELECT policy** to use the function instead of recursive queries
3. **Fixes the groups SELECT policy** to avoid recursion
4. **Fixes the messages SELECT policy** to use the function for group messages

## After Running the Fix:

- ✅ Groups can be created
- ✅ Group members can be viewed
- ✅ Messages will load and display
- ✅ Users will appear in sidebar
- ✅ All queries will work properly

## If You Still Have Issues:

1. Make sure you ran the SQL fix completely
2. Check Supabase logs for any errors
3. Clear your browser cache and reload
4. Verify your environment variables are set correctly in Vercel

---

**This is a database-level fix and MUST be applied in Supabase. The code changes alone won't fix the recursion issue.**

