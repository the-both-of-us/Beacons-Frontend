# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Social App.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click **Select a project** (top left) → **New Project**

3. Fill in:
   - **Project name**: `Social App` (or any name you want)
   - **Location**: Leave as default or select your organization
   - Click **Create**

4. Wait for the project to be created (takes a few seconds)

5. Make sure your new project is selected (check the dropdown at the top)

---

## Step 2: Enable Google OAuth API

1. In the left sidebar, click **APIs & Services** → **Enable APIs and Services**

2. Search for **"Google+ API"** or **"Google Identity"**

3. Click on it and click **Enable**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen** (left sidebar)

2. Select **External** (allows anyone with a Google account to sign in)
   - Click **Create**

3. Fill in the App information:
   - **App name**: `Social App`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload a logo
   - **Application home page**: `http://localhost:3000` (for development)
   - **Authorized domains**: Leave empty for now (needed for production only)
   - **Developer contact information**: Your email address

4. Click **Save and Continue**

5. **Scopes**: Click **Add or Remove Scopes**
   - Select:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click **Update** → **Save and Continue**

6. **Test users** (optional for now):
   - You can add specific test users if needed
   - Click **Save and Continue**

7. **Summary**: Review and click **Back to Dashboard**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials** (left sidebar)

2. Click **+ Create Credentials** (top) → **OAuth client ID**

3. Select **Application type**: **Web application**

4. Fill in:
   - **Name**: `Social App Web Client`

   - **Authorized JavaScript origins**:
     - Click **+ Add URI**
     - Add: `http://localhost:3000`

   - **Authorized redirect URIs**:
     - Click **+ Add URI**
     - Add: `http://localhost:3000/api/auth/callback/google`

5. Click **Create**

6. A popup will show your credentials:
   - **Client ID**: Copy this (looks like: `123456789-abcdef.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like: `GOCSPX-abc123xyz...`)

   **IMPORTANT**: Save these somewhere safe! You'll need them in the next step.

7. Click **OK**

---

## Step 5: Update Your Frontend Environment Variables

1. Open `/Social-app-frontend/.env.local`

2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_API_URL=http://localhost:5211
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5211/chatHub

# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_4
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_FROM_STEP_4

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
```

3. Generate a random secret for `NEXTAUTH_SECRET`:
   - Run this command in terminal:
   ```bash
   openssl rand -base64 32
   ```
   - Copy the output and paste it as your `NEXTAUTH_SECRET`

4. Save the file

---

## Step 6: Restart Your Frontend

```bash
cd /Users/hassanbaig/Desktop/hackathon/Social-app-frontend
npm run dev
```

---

## Step 7: Test the Authentication

1. Open your browser and go to `http://localhost:3000`

2. Click **Login** or **Sign In**

3. You should be redirected to Google's login page

4. Sign in with **any Google account** (your personal Gmail, etc.)

5. Google will ask for permission to share your email and profile

6. Click **Continue**

7. You'll be redirected back to your app, now logged in!

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what you configured in Google Cloud Console.

**Solution**:
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Make sure **Authorized redirect URIs** contains exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Save and try again

---

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen is not properly configured.

**Solution**:
1. Go to **OAuth consent screen** in Google Cloud Console
2. Make sure status is **"Testing"** or **"In production"**
3. If in Testing mode, add your email as a test user
4. Try again

---

### Error: "NEXTAUTH_SECRET is not defined"

**Problem**: You didn't generate a secret.

**Solution**:
```bash
# Generate a secret
openssl rand -base64 32

# Or use this online: https://generate-secret.vercel.app/32
```
Add it to your `.env.local` file.

---

## For Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Update OAuth consent screen**:
   - Change from "Testing" to "In production"
   - Verify your domain

2. **Add production URLs to Google Credentials**:
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`

3. **Update environment variables** on your hosting platform:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL=https://your-domain.com`
   - `NEXTAUTH_SECRET` (same secret you generated)

---

## What You Get

After signing in with Google, you'll have access to:
- User's email address
- User's name
- User's profile picture
- Unique Google User ID

This information is available in your frontend via the `useAuth()` hook or `useSession()` hook from NextAuth.

---

## Need Help?

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)
