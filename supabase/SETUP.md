# LYNTO - Supabase Setup Guide

Step-by-step instructions to set up your Supabase project so it connects to the LYNTO app without bugs.

---

## Step 1: Create a Supabase Project (if you haven't already)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organisation, give the project a name (e.g. "LYNTO"), set a strong database password, and select a region close to your users
4. Wait for the project to finish provisioning (takes about 2 minutes)

---

## Step 2: Get Your Project Credentials

1. In the Supabase dashboard, go to **Settings** (gear icon in the left sidebar) → **API**
2. Copy the **Project URL** (starts with `https://...supabase.co`)
3. Copy the **anon/public** key (under "Project API keys")
4. Open the `.env` file in the LYNTO project root and update:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Step 3: Run the Database Schema

1. In the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** of the file and paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" — this means all tables, views, functions, triggers, RLS policies, and indexes have been created

**Important:** Run the schema only once. If you need to reset, you'll need to drop all objects first.

---

## Step 4: Disable Email Confirmation (Required for MVP)

This is **critical** — without this, new users won't be able to log in after registration.

1. Go to **Authentication** (left sidebar) → **Providers** (or **Settings** under Auth)
2. Under **Email**, find the setting **"Confirm email"** (or "Enable email confirmations")
3. **Turn it OFF** / Uncheck it
4. Click **Save**

This means users can log in immediately after signing up without needing to click a confirmation link in their email.

---

## Step 5: Configure Redirect URLs

This is needed for the password reset / invite flow to work properly.

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to your app's URL:
   - For local development: `http://localhost:5173`
   - For production: your deployed URL (e.g. `https://lynto.app`)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/set-password`
   - `http://localhost:5173/**`
   - (For production, add your production equivalents too)
4. Click **Save**

---

## Step 6: Create the First Platform Admin

Since admins can only be created by other admins, you need to manually create the first one.

### 6a: Create the Auth User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Enter:
   - Email: your admin email (e.g. `admin@lynto.com`)
   - Password: a strong password
   - Check "Auto Confirm User" if available
4. Click **Create User**
5. Note the **User UID** that appears (you'll need it in the next step)

### 6b: Insert the Admin Record

1. Go to **SQL Editor** → **New Query**
2. Run this SQL (replace the values with your own):

```sql
INSERT INTO platform_admins (id, email, full_name, admin_role, status)
VALUES (
  'PASTE_USER_UID_HERE',
  'admin@lynto.com',
  'Your Name',
  'primary_admin',
  'active'
);
```

3. Click **Run**

You can now log in at `/admin/login` with these credentials.

---

## Step 7: Configure Email Templates (Optional but Recommended)

When carers or admins are invited, they receive a password reset email. You can customise this.

1. Go to **Authentication** → **Email Templates**
2. Click on **Reset Password**
3. Customise the email body. The `{{ .ConfirmationURL }}` variable contains the link. Example:

```html
<h2>Welcome to LYNTO</h2>
<p>You've been invited to the LYNTO platform. Click the link below to set your password:</p>
<p><a href="{{ .ConfirmationURL }}">Set Your Password</a></p>
<p>This link expires in 24 hours.</p>
```

4. Click **Save**

---

## Step 8: Start the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

- **Register a new agency** at `/register` — this creates a manager account
- **Admin login** at `/admin/login` — use the admin you created in Step 6
- **Carer/Manager login** at `/login`

---

## Troubleshooting

### "Invalid login credentials"
- Make sure email confirmation is disabled (Step 4)
- Check the email and password are correct
- For admin login, make sure the admin record exists in `platform_admins` table

### "User already registered"
- The email is already in use in Supabase Auth
- Go to **Authentication → Users** to check

### Invite emails not sending
- Supabase has a built-in email rate limit (3 emails/hour on the free plan)
- Check **Authentication → Logs** for email sending errors
- For production, configure a custom SMTP provider under **Settings → Auth → SMTP Settings**

### "permission denied for table..."
- RLS policies may not be set up correctly
- Make sure you ran the **full** `schema.sql` file (it includes all RLS policies)
- Check that the user has the correct role in the `users` or `platform_admins` table

### Password reset link goes to wrong URL
- Check the **Redirect URLs** in Step 5
- Make sure the Site URL matches your actual app URL
- The redirect URL in the code uses `window.location.origin + '/set-password'`

---

## Architecture Notes

- **RLS (Row Level Security)** is enabled on all tables. Each user can only see data relevant to their agency/role.
- **Carers** can only see their assigned clients and their own visit entries.
- **Managers** can see all data within their agency.
- **Platform Admins** can see all agencies and their data.
- The `agency_stats` view computes carer/client/alert counts per agency.
- Alerts are auto-created by a database trigger when a visit entry has `amber` or `red` risk level.
- The invite flow uses `signUp` + `resetPasswordForEmail` (not `inviteUserByEmail` which requires the service role key).
