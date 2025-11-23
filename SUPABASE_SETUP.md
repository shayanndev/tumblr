# Supabase Configuration for tumblR

## Important: Disable Email Confirmation (Recommended for Development)

By default, Supabase requires users to confirm their email before they can log in. For a small group chat app, you may want to disable this.

### To Disable Email Confirmation:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** (or **Auth** → **Providers** → **Email**)
3. Find **"Enable email confirmations"** or **"Confirm email"** setting
4. **Disable** it (toggle it off)
5. Save the changes

### Alternative: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled:

1. Users will receive a confirmation email after registration
2. They must click the confirmation link before they can log in
3. Make sure your Supabase project has email sending configured:
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure SMTP or use Supabase's built-in email service

## Verify Database Trigger is Working

The profile creation is handled automatically by a database trigger. To verify it's working:

1. Go to **Database** → **Functions** in Supabase
2. You should see `handle_new_user` function
3. Go to **Database** → **Triggers**
4. You should see `on_auth_user_created` trigger

If these don't exist, run the SQL from `supabase-schema.sql` again, specifically these parts:

```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS) Policies

Make sure RLS is enabled and policies are set correctly:

1. Go to **Database** → **Tables** → **profiles**
2. Click on **Policies** tab
3. You should see:
   - "Users can view all profiles" (SELECT)
   - "Users can update own profile" (UPDATE)

If policies are missing, run the RLS section from `supabase-schema.sql`.

## Troubleshooting

### Users can't log in after registration
- Check if email confirmation is enabled
- If enabled, users must confirm email first
- Check spam folder for confirmation emails
- Or disable email confirmation as described above

### Profile creation fails
- The database trigger should handle this automatically
- Check if the trigger exists in Database → Triggers
- Verify the function has SECURITY DEFINER (allows bypassing RLS)

### 401 Unauthorized errors
- User is not authenticated (email not confirmed or session expired)
- Check if user has confirmed their email
- Try logging out and back in

