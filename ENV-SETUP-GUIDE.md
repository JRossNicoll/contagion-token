# Environment Variables Setup Guide

Your monitoring scripts need these environment variables to work. Follow this guide carefully.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"Project Settings"** (gear icon in sidebar)
4. Click **"API"** in the settings menu
5. You'll see three important values:

\`\`\`
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon)
\`\`\`

## Step 2: Create .env.local File

In your project directory (`~/contagion-token`), create a file named `.env.local`:

\`\`\`bash
nano .env.local
\`\`\`

Paste this content and fill in your actual values:

\`\`\`env
# Supabase Configuration (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Contract Configuration (already set)
CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47

# BSC Configuration
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=your_reflection_pool_private_key_here

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

**Save the file:**
- Press `Ctrl + O` (write out)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

## Step 3: Get Your Private Key

The `PRIVATE_KEY` should be from the wallet you used as the **reflection pool** during contract deployment.

**To export private key from MetaMask:**
1. Open MetaMask
2. Click the 3 dots next to the account
3. Click "Account details"
4. Click "Show private key"
5. Enter your password
6. Copy the private key
7. Paste it in the .env.local file

**⚠️ SECURITY WARNING:**
- NEVER share your private key
- NEVER commit .env.local to git (it's already in .gitignore)
- This key should be for a dedicated wallet with minimal funds (just gas)

## Step 4: Verify Environment Variables

Check if the file was created correctly:

\`\`\`bash
cat .env.local
\`\`\`

You should see all values filled in (no empty `=` signs).

## Step 5: Test the Setup

Now try running the tracking script:

\`\`\`bash
npx tsx scripts/track-infections.ts
\`\`\`

**Expected output:**
\`\`\`
[2025-01-11T...] Starting infection tracking...
[2025-01-11T...] Infection tracking active
\`\`\`

If you see this, you're all set! The script is now monitoring your contract.

## Troubleshooting

### Error: "supabaseUrl is required"
- Your .env.local file doesn't have `NEXT_PUBLIC_SUPABASE_URL` set
- Make sure there are no spaces around the `=` sign
- Verify the URL starts with `https://`

### Error: "invalid private key"
- Your PRIVATE_KEY is incorrect or missing the `0x` prefix
- Re-export from MetaMask and try again

### Error: "could not detect network"
- RPC_URL is incorrect or the BSC RPC is down
- Try alternative RPC: `https://bsc-dataseed1.binance.org/`

### Script runs but no data appears
- Make sure you've run all 3 SQL scripts in Supabase
- Check if contract address is correct
- Verify the contract has transactions

## Adding to Vercel

Once local setup works, add the same variables to Vercel:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable from .env.local
4. Redeploy your project

---

**Need help?** Make sure all values are copied exactly as they appear in Supabase, with no extra spaces or quotes.
