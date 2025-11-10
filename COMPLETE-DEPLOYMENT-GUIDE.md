# Contagion Token - Complete Deployment Guide

**For ChatGPT and Claude AI Assistants**

This is a comprehensive, step-by-step guide to deploy the Contagion Token system from zero to production. Follow every step in order.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Local Environment Setup](#phase-1-local-environment-setup)
4. [Phase 2: Database Setup (Supabase)](#phase-2-database-setup-supabase)
5. [Phase 3: Smart Contract Deployment](#phase-3-smart-contract-deployment)
6. [Phase 4: Post-Deployment Contract Configuration](#phase-4-post-deployment-contract-configuration)
7. [Phase 5: Monitoring Scripts Deployment](#phase-5-monitoring-scripts-deployment)
8. [Phase 6: Frontend Deployment](#phase-6-frontend-deployment)
9. [Phase 7: Testing and Verification](#phase-7-testing-and-verification)
10. [Phase 8: Go Live](#phase-8-go-live)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance](#maintenance)

---

## System Overview

**What is Contagion Token?**

Contagion is an ERC20 token on Binance Smart Chain with:
- 6% tax (5% reflections + 1% gas) on all DEX trades
- Anti-sniper protection: 10% tax for first 25 transactions (adjustable)
- Off-chain reflection distribution to proxy wallets
- Automated holder tracking and proxy detection
- Real-time dashboard showing stats

**System Components:**

1. **Smart Contract** (Solidity) - The token contract on BSC
2. **Database** (Supabase PostgreSQL) - Stores holder data, infections, distributions
3. **Monitoring Scripts** (TypeScript/Node.js) - Track transactions and manage reflections
4. **Frontend** (Next.js) - Dashboard to view stats and claim reflections
5. **BSC Network** - Blockchain infrastructure

**How It Works:**

1. User buys CONTAGION on PancakeSwap
2. 6% tax collected in CONTAGION tokens → reflection pool
3. During first 25 transactions: 10% tax instead of 6%
4. `track-infections.ts` monitors all transfers → saves to database
5. `monitor-reflections.ts` detects proxy wallets → distributes reflections off-chain
6. Users see their accumulated reflections on dashboard
7. Users can claim reflections when they want (triggers on-chain transaction)

---

## Prerequisites

### Required Accounts

- [ ] Binance Smart Chain wallet (MetaMask recommended)
- [ ] Supabase account (free tier works)
- [ ] Vercel account (free tier works)
- [ ] GitHub account (for version control)

### Required Software

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed ([Download](https://git-scm.com/))
- [ ] Code editor (VS Code recommended)
- [ ] MetaMask browser extension

### Required Assets

- [ ] 0.5-1 BNB in wallet (for contract deployment and gas)
- [ ] Initial token liquidity (e.g., 100M CONTAGION + 1 BNB)

### Knowledge Requirements

- Basic understanding of blockchain/crypto
- Basic terminal/command line usage
- Ability to copy/paste and follow instructions carefully

---

## Phase 1: Local Environment Setup

### Step 1.1: Clone the Repository

Open terminal and run:

\`\`\`bash
# Clone the project
git clone <your-repo-url> contagion-token
cd contagion-token

# Install dependencies
npm install
\`\`\`

**Verification:** You should see `node_modules` folder created with no errors.

### Step 1.2: Create Environment File

Create a file called `.env.local` in the project root:

\`\`\`bash
# On Mac/Linux
touch .env.local

# On Windows
type nul > .env.local
\`\`\`

Open `.env.local` and add these placeholders (we'll fill them in later):

\`\`\`env
# Network
RPC_URL=https://bsc-dataseed.binance.org/
CHAIN_ID=56

# Contract (will be filled after deployment)
CONTRACT_ADDRESS=

# Wallet (your deployment wallet)
PRIVATE_KEY=

# Supabase (will be filled after database setup)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Reflection Settings
SNAPSHOT_THRESHOLD=1
MIN_HOLDER_BALANCE=100000000000
SCAN_INTERVAL=30000
\`\`\`

**Verification:** File created in project root.

### Step 1.3: Verify Contract Code

Open `contracts/ContagionToken.sol` and verify these key features exist:

- [ ] Anti-sniper logic (check for `antiSniperActive`, `antiSniperTaxRate`, `antiSniperTransactionLimit`)
- [ ] Tax collection (check for `reflectionTaxRate`, `gasTaxRate`)
- [ ] Proxy wallet system (check for `setProxyWallets`)
- [ ] Reflection distribution (check for `distributeReflections`)

**All features should be present.**

---

## Phase 2: Database Setup (Supabase)

### Step 2.1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - Project name: `contagion-token`
   - Database password: Generate strong password (SAVE THIS!)
   - Region: Choose closest to your users
   - Pricing plan: Free
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

**Verification:** You see the project dashboard with database ready.

### Step 2.2: Get Supabase Credentials

In your Supabase project dashboard:

1. Click "Settings" (gear icon, bottom left)
2. Click "API" in settings menu
3. You'll see:
   - **Project URL** - Copy this
   - **anon public** key - Copy this
   - **service_role** key - Copy this (click "Reveal" first)

Now update `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=<paste Project URL here>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon public key here>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key here>
\`\`\`

**Verification:** All three values filled in `.env.local`.

### Step 2.3: Run Database Migrations

We need to create the database tables. In Supabase:

1. Click "SQL Editor" (in left sidebar)
2. Click "New query"
3. Open `scripts/01-add-missing-columns.sql` from your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Repeat for `scripts/create-views.sql`

**Verification:** Go to "Table Editor" → you should see these tables:
- holders
- infections
- proxy_wallets
- snapshots
- distributions
- script_logs
- reflection_claims

### Step 2.4: Enable Row Level Security (RLS)

For security, we need to set up RLS policies. In SQL Editor, run:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE infections ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxy_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_claims ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON holders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON infections FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON proxy_wallets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON snapshots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON distributions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON script_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON reflection_claims FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access for dashboard
CREATE POLICY "Public read access" ON holders FOR SELECT USING (true);
CREATE POLICY "Public read access" ON infections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON snapshots FOR SELECT USING (true);
CREATE POLICY "Public read access" ON distributions FOR SELECT USING (true);
\`\`\`

**Verification:** Go to "Authentication" → "Policies" → verify policies created.

---

## Phase 3: Smart Contract Deployment

### Step 3.1: Prepare Wallet

1. Open MetaMask
2. Add BSC Mainnet:
   - Network Name: BSC Mainnet
   - RPC URL: https://bsc-dataseed.binance.org/
   - Chain ID: 56
   - Currency Symbol: BNB
   - Block Explorer: https://bscscan.com
3. Ensure you have at least 0.5 BNB for deployment

### Step 3.2: Get Your Private Key

**WARNING: NEVER share your private key with anyone!**

In MetaMask:
1. Click three dots → Account details
2. Click "Show private key"
3. Enter password
4. Copy private key

Update `.env.local`:

\`\`\`env
PRIVATE_KEY=<paste private key here, NO 0x prefix>
\`\`\`

### Step 3.3: Prepare Deployment Wallets

You need THREE addresses:

1. **Reflection Pool** - Holds accumulated reflection tokens
2. **Gas Pool** - Holds accumulated gas tokens
3. **Owner** - Your main wallet (from MetaMask)

**Option A: Use the same wallet for all three** (simplest for testing)

\`\`\`
reflectionPool = your MetaMask address
gasPool = your MetaMask address
owner = your MetaMask address
\`\`\`

**Option B: Use separate wallets** (recommended for production)

Create 2 new MetaMask accounts:
- Account 2: Reflection Pool
- Account 3: Gas Pool

### Step 3.4: Deploy Contract via Remix

**Why Remix?** It's the safest and easiest way to deploy smart contracts.

1. Go to https://remix.ethereum.org
2. Click "File Explorer" icon (top left)
3. Right-click "contracts" → New File → `ContagionToken.sol`
4. Open `contracts/ContagionToken.sol` from your project
5. Copy ALL the code
6. Paste into Remix
7. Remix will auto-import OpenZeppelin contracts

**Compile:**

1. Click "Solidity Compiler" icon (left sidebar)
2. Select compiler version: `0.8.20`
3. Enable "Optimization": ON
4. Runs: `200`
5. Click "Compile ContagionToken.sol"
6. Verify green checkmark appears

**Deploy:**

1. Click "Deploy & Run Transactions" icon (left sidebar)
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will pop up → Connect your wallet
4. Verify correct network (BSC Mainnet, Chain ID 56)
5. Contract: Select "ContagionToken"
6. Fill in constructor parameters:

\`\`\`
NAME: "Contagion"
SYMBOL: "CONTG"
REFLECTIONPOOL: <your reflection pool address>
GASPOOL: <your gas pool address>
DEXROUTER: 0x10ED43C718714eb63d5aA57B78B54704E256024E
\`\`\`

7. Click "Deploy"
8. MetaMask pops up → Click "Confirm"
9. Wait 10-30 seconds for transaction to confirm

**Verification:**

1. Click "Deployed Contracts" (bottom of left sidebar)
2. You should see "CONTAGIONTOKEN AT 0x..."
3. Copy this address
4. Update `.env.local`:

\`\`\`env
CONTRACT_ADDRESS=<paste contract address here>
NEXT_PUBLIC_CONTRACT_ADDRESS=<same address>
\`\`\`

5. Visit https://bscscan.com/address/<your-contract-address>
6. Verify contract exists

### Step 3.5: Verify Contract on BSCScan

**This makes your contract readable on BSCScan.**

1. Go to https://bscscan.com/verifyContract
2. Enter your contract address
3. Compiler Type: Solidity (Single file)
4. Compiler Version: v0.8.20+commit.a1b79de6
5. License Type: MIT
6. Click "Continue"

7. **Get flattened source code:**
   - In Remix, right-click `ContagionToken.sol`
   - Select "Flatten"
   - Copy the flattened code

8. Paste flattened code into "Solidity Contract Code" field
9. Optimization: Yes
10. Runs: 200
11. Constructor Arguments:
    - This is auto-encoded, but if needed, use Remix "Encode Constructor Arguments"
12. Click "Verify and Publish"
13. Wait for success message

**Verification:** Visit BSCScan contract page → you see "Code" tab with green checkmark.

---

## Phase 4: Post-Deployment Contract Configuration

Now that the contract is deployed, we need to configure it.

### Step 4.1: Set Anti-Sniper Configuration

In Remix, with your contract still deployed:

1. Find `setAntiSniper` function
2. Fill in parameters:
   - `active`: true
   - `taxRate`: 10 (for 10% tax)
   - `txLimit`: 25 (first 25 transactions)
3. Click "transact"
4. Confirm in MetaMask

**Verification:** Call `getAntiSniperStatus()` → should return `(true, 0, 25)`.

### Step 4.2: Add Liquidity on PancakeSwap

**Prepare:**
- You need CONTAGION tokens + BNB
- Example: 100,000,000 CONTAGION + 1 BNB

**Steps:**

1. Go to https://pancakeswap.finance/add
2. Connect MetaMask wallet
3. Select token 1: BNB
4. Select token 2: Paste your CONTAGION contract address
5. Enter amounts (e.g., 1 BNB + 100M CONTAGION)
6. Click "Supply"
7. Confirm two transactions:
   - Approve CONTAGION spending
   - Add liquidity
8. Save your LP tokens (don't burn yet!)

**Verification:** Visit PancakeSwap → Liquidity → you see your position.

### Step 4.3: Set DEX Pair Address in Contract

**Find your pair address:**

1. Go to https://bscscan.com/address/<your-contract-address>
2. Click "Read Contract"
3. Call `dexRouter()` → copy the router address
4. Go to https://bscscan.com/address/<router-address>
5. Click "Read Contract"
6. Find `factory()` function → call it → copy factory address
7. Go to factory contract
8. Find `getPair(tokenA, tokenB)`
9. Call with:
   - tokenA: Your CONTAGION address
   - tokenB: WBNB (0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c)
10. Result is your pair address

**Update contract:**

In Remix:
1. Find `setRouter` function
2. Enter your pair address (NOT the router, but the PAIR)
3. Click "transact"
4. Confirm in MetaMask

**Why?** The contract checks if transfers are to/from this pair to apply taxes.

### Step 4.4: Configure Transaction Limits

Default limits are 2% per transaction and 2% per wallet. Adjust if needed:

\`\`\`javascript
// In Remix
setMaxTransaction(2) // 2% of total supply
setMaxWallet(2) // 2% max wallet size
\`\`\`

**Verification:** Call `maxTransactionAmount()` and `maxWalletAmount()` to confirm.

### Step 4.5: Exclude System Addresses

Exclude the liquidity pool from limits and taxes:

\`\`\`javascript
// Get your liquidity pool address from PancakeSwap
excludeFromLimits(<your-LP-pair-address>, true)
excludeFromTax(<your-LP-pair-address>, true)
\`\`\`

Also exclude your team wallets if needed:

\`\`\`javascript
excludeFromLimits(<team-wallet>, true)
excludeFromTax(<team-wallet>, true)
\`\`\`

---

## Phase 5: Monitoring Scripts Deployment

### Step 5.1: Test Scripts Locally First

Before deploying to production, test locally:

\`\`\`bash
# Make sure all env vars are set in .env.local
cat .env.local

# Test infection tracker
npx tsx scripts/track-infections.ts
\`\`\`

Let it run for 30 seconds. You should see:

\`\`\`
✓ Environment variables loaded successfully
✓ Contract: 0x...
✓ RPC: https://bsc-dataseed.binance.org/
Starting infection tracking with polling method...
Infection tracking active (polling every 3 seconds)
\`\`\`

Press Ctrl+C to stop.

Now test reflection monitor:

\`\`\`bash
npx tsx scripts/monitor-reflections.ts
\`\`\`

You should see:

\`\`\`
✓ Environment variables loaded successfully
Starting Contagion reflection monitor
Pool balance check...
\`\`\`

Press Ctrl+C to stop.

**If errors occur:** Check the [Troubleshooting](#troubleshooting) section.

### Step 5.2: Choose Deployment Method

**Option A: Railway (Recommended - Easiest)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect your repo
6. Add two services:
   - Service 1: infection-tracker
   - Service 2: reflection-monitor

For each service:
1. Settings → Add start command:
   \`\`\`
   npx tsx scripts/track-infections.ts
   \`\`\`
   (or `monitor-reflections.ts` for service 2)

2. Variables → Add all env vars from `.env.local`
3. Click "Deploy"

**Verification:** Check logs in Railway → you should see the same output as local testing.

**Option B: Render**

1. Go to https://render.com
2. Sign up
3. New → Background Worker
4. Connect GitHub repo
5. Name: infection-tracker
6. Build Command: `npm install`
7. Start Command: `npx tsx scripts/track-infections.ts`
8. Add environment variables
9. Create Worker
10. Repeat for reflection-monitor

**Option C: Run on VPS (DigitalOcean, AWS, etc.)**

1. SSH into your server
2. Install Node.js 18+
3. Clone your repo
4. Install PM2: `npm install -g pm2`
5. Start scripts:

\`\`\`bash
pm2 start scripts/track-infections.ts --name infection-tracker --interpreter npx --interpreter-args tsx
pm2 start scripts/monitor-reflections.ts --name reflection-monitor --interpreter npx --interpreter-args tsx
pm2 save
pm2 startup
\`\`\`

**Verification:** `pm2 status` shows both scripts running.

**Option D: Keep Running Locally (Not Recommended for Production)**

Only for testing/development:

\`\`\`bash
# Terminal 1
npx tsx scripts/track-infections.ts

# Terminal 2  
npx tsx scripts/monitor-reflections.ts
\`\`\`

Keep these terminals open 24/7.

---

## Phase 6: Frontend Deployment

### Step 6.1: Update Frontend Environment Variables

The frontend needs these env vars for production. In Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add:

\`\`\`
NEXT_PUBLIC_CONTRACT_ADDRESS=<your contract address>
NEXT_PUBLIC_SUPABASE_URL=<supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
NEXT_PUBLIC_CHAIN_ID=56
\`\`\`

### Step 6.2: Deploy to Vercel

**Option A: GitHub Integration (Recommended)**

1. Push your code to GitHub:

\`\`\`bash
git add .
git commit -m "Initial deployment"
git push origin main
\`\`\`

2. Go to https://vercel.com
3. Sign in with GitHub
4. Click "New Project"
5. Import your GitHub repo
6. Framework Preset: Next.js
7. Click "Deploy"
8. Wait 2-3 minutes

**Verification:** Visit your Vercel URL → dashboard loads.

**Option B: Vercel CLI**

\`\`\`bash
npm i -g vercel
vercel login
vercel --prod
\`\`\`

Follow prompts, deploy completes.

### Step 6.3: Configure Custom Domain (Optional)

In Vercel:
1. Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Wait for SSL certificate (automatic)

---

## Phase 7: Testing and Verification

### Step 7.1: End-to-End Test

**Test Buy Transaction:**

1. Go to https://pancakeswap.finance/swap
2. Connect wallet (use a TEST wallet, not your main wallet)
3. Swap BNB → CONTAGION
4. Set slippage to 12% (for 10% anti-sniper tax)
5. Confirm transaction
6. Wait for confirmation

**Verify in Dashboard:**

1. Visit your deployed dashboard
2. Check "Infection Overview" section
3. Your test wallet should appear as a holder
4. Transaction count should increment

**Verify in Database:**

1. Go to Supabase → Table Editor
2. Open `holders` table
3. Find your test wallet address
4. Verify balance matches

**Verify Anti-Sniper Working:**

1. Check contract on BSCScan
2. Read Contract → `getAntiSniperStatus()`
3. Should show:
   - active: true
   - txCount: 1 (or higher)
   - txLimit: 25

### Step 7.2: Test Sell Transaction

1. PancakeSwap → Swap CONTAGION → BNB
2. Set slippage to 12%
3. Confirm
4. Verify tax deducted (10%)

### Step 7.3: Verify Monitoring Scripts

**Check Script Logs:**

1. Go to Supabase → Table Editor → `script_logs`
2. Sort by `created_at` descending
3. You should see recent log entries:
   - "Tracked infection"
   - "Pool balance check"

**If no logs:** Check your monitoring script deployment (Railway/Render/VPS).

### Step 7.4: Test Proxy Detection

**Simulate Proxy Activity:**

From your test wallet, send BNB to another address:

1. Transfer 0.01 BNB to a new address
2. Wait 30 seconds
3. Check Supabase → `proxy_wallets` table
4. Your new address should appear as a proxy

**Note:** Full proxy detection takes 7 days. For testing, you can manually insert proxies:

\`\`\`sql
INSERT INTO proxy_wallets (holder_address, proxy_address, proxy_type, transaction_hash, detected_at)
VALUES ('<your-test-wallet>', '<proxy-address>', 'post_purchase', '0x...', NOW());
\`\`\`

### Step 7.5: Test Reflection Distribution

**Trigger Manual Snapshot:**

If reflection pool < 1% of supply, manually trigger for testing:

In Remix:
1. Call `takeSnapshot()`
2. Wait for transaction confirmation
3. Note the returned snapshot ID

**Verify Distribution:**

1. Check Supabase → `snapshots` table
2. Verify new snapshot exists
3. Check `distributions` table → verify amounts calculated
4. Check `holders` table → verify `virtual_reflection_balance` updated

### Step 7.6: Verify Anti-Sniper Auto-Disable

You need to perform 25 transactions to test this. For testing:

**Option 1: Lower the limit temporarily**

In Remix:
\`\`\`javascript
setAntiSniper(true, 10, 3) // Only 3 transactions for testing
\`\`\`

Then perform 3 buy transactions. After the 3rd:

1. Call `getAntiSniperStatus()`
2. Should show `active: false`
3. Call `getCurrentTaxRate()`
4. Should return `6` (normal tax, not 10)

**Option 2: Wait for organic transactions**

Monitor the contract. After 25 real transactions, anti-sniper auto-disables.

---

## Phase 8: Go Live

### Step 8.1: Final Checklist

Before announcing to the public:

**Smart Contract:**
- [x] Contract deployed and verified on BSCScan
- [x] Anti-sniper configured (10% for 25 transactions)
- [x] Liquidity added to PancakeSwap
- [x] DEX pair address set in contract
- [x] Transaction limits configured
- [x] System addresses excluded from taxes/limits

**Database:**
- [x] All tables created in Supabase
- [x] Views created (`holder_statistics`, `distribution_summary`)
- [x] RLS policies enabled
- [x] Test data inserted and visible

**Monitoring:**
- [x] Infection tracker running (Railway/Render/VPS)
- [x] Reflection monitor running
- [x] Scripts writing to database
- [x] No errors in script logs

**Frontend:**
- [x] Dashboard deployed to Vercel
- [x] Environment variables set
- [x] Wallet connection working
- [x] Stats displaying correctly
- [x] Custom domain configured (optional)

**Testing:**
- [x] Test buy transaction successful (10% tax applied)
- [x] Test sell transaction successful
- [x] Holder appears in dashboard
- [x] Proxy detection working
- [x] Reflection distribution tested

### Step 8.2: Prepare Marketing Materials

Create announcement with:

**Contract Address:**
\`\`\`
<your contract address>
\`\`\`

**Links:**
- BSCScan: `https://bscscan.com/token/<address>`
- PancakeSwap: `https://pancakeswap.finance/swap?outputCurrency=<address>`
- Dashboard: `https://<your-vercel-url>`

**Key Info:**
- Total Supply: 1,000,000,000 CONTAGION
- Tax: 10% for first 25 transactions, then 6%
- Max Transaction: 2% (20M tokens)
- Max Wallet: 2% (20M tokens)
- Reflection rewards distributed to proxy wallets

### Step 8.3: Launch Sequence

**T-24 hours: Pre-Launch**
1. Announce launch time on social media
2. Share contract address for verification
3. Warn about anti-sniper tax (10% for first 25 transactions)

**T-0: Launch**
1. Add liquidity to PancakeSwap (if not already done)
2. Announce live on all channels
3. Share PancakeSwap buy link
4. Share dashboard link

**T+1 hour: Monitor**
1. Watch transaction count
2. Monitor for issues
3. Check script logs
4. Respond to community questions

**T+25 transactions: Anti-Sniper Ends**
1. Verify anti-sniper disabled (call `getAntiSniperStatus()`)
2. Announce normal 6% tax now active
3. Update marketing materials

### Step 8.4: Post-Launch Monitoring

**First 24 Hours:**
- Check script health every 2 hours
- Monitor database for errors
- Watch for unusual transaction patterns
- Engage with community

**First Week:**
- Daily script health checks
- Monitor reflection distributions
- Gather community feedback
- Optimize as needed

**Ongoing:**
- Weekly script maintenance
- Monthly database backups
- Quarterly security audits
- Regular community updates

---

## Troubleshooting

### Issue: "RPC Error: rate limit exceeded"

**Problem:** BSC public RPC nodes rate-limit requests.

**Solution:**
1. Use a private RPC node (QuickNode, GetBlock, Ankr)
2. Or add delays between requests:
   \`\`\`typescript
   await new Promise(resolve => setTimeout(resolve, 1000))
   \`\`\`

### Issue: "Cannot find module"

**Problem:** Dependencies not installed.

**Solution:**
\`\`\`bash
npm install
# or
npm ci
\`\`\`

### Issue: Scripts not writing to database

**Problem:** Supabase credentials wrong or RLS blocking writes.

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Check RLS policies allow service role access:
   \`\`\`sql
   SELECT * FROM pg_policies WHERE tablename = 'holders';
   \`\`\`

### Issue: "Insufficient balance" when buying

**Problem:** Anti-sniper tax + slippage too low.

**Solution:**
- Set slippage to 12% during anti-sniper period
- Set slippage to 8% after anti-sniper ends

### Issue: Dashboard shows "No holders found"

**Problem:** Infection tracker not running or database not syncing.

**Solution:**
1. Check infection tracker logs (Railway/Render)
2. Verify script is running: `pm2 status` (if using PM2)
3. Check `script_logs` table for errors

### Issue: Proxy wallets not detected

**Problem:** Historical transaction lookup failing.

**Solution:**
- Switch RPC provider (some don't support `eth_getHistory`)
- Use BSCScan API as fallback (requires API key)
- Manually insert known proxies for testing

### Issue: Reflections not distributing

**Problem:** Reflection pool below threshold or monitor script not running.

**Solution:**
1. Check pool balance: Read Contract → `balanceOf(reflectionPool)`
2. Verify threshold: Read Contract → `snapshotThreshold()`
3. Manually trigger: `takeSnapshot()` in Remix
4. Check monitor script logs

### Issue: MetaMask transaction failing

**Problem:** Gas limit too low or contract revert.

**Solution:**
1. Check error message on BSCScan
2. Common reverts:
   - "Exceeds max transaction amount" → reduce amount
   - "Max sells per block exceeded" → wait 1 block
   - "Insufficient balance" → check actual balance

### Issue: Contract not verified on BSCScan

**Problem:** Constructor arguments incorrect or flattening issues.

**Solution:**
1. Use Remix to get constructor ABI:
   - Deploy page → Copy "Encoded Constructor Arguments"
2. Retry verification with exact flattened code
3. Ensure no extra imports or commented code

---

## Maintenance

### Daily Tasks

**Monitor Script Health:**
\`\`\`bash
# Check if scripts are running
pm2 status
# or check Railway/Render dashboard
\`\`\`

**Check Database:**
\`\`\`sql
-- Recent infections
SELECT * FROM infections ORDER BY created_at DESC LIMIT 10;

-- Recent errors
SELECT * FROM script_logs WHERE log_type = 'error' ORDER BY created_at DESC LIMIT 10;
\`\`\`

### Weekly Tasks

**Script Maintenance:**
1. Review logs for errors
2. Optimize query performance if needed
3. Update RPC endpoints if rate-limited

**Database Maintenance:**
\`\`\`sql
-- Archive old script logs (keep last 7 days)
DELETE FROM script_logs WHERE created_at < NOW() - INTERVAL '7 days';

-- Backup critical tables
-- (Supabase has automatic backups, but you can export manually)
\`\`\`

### Monthly Tasks

**Performance Review:**
- Check reflection distribution success rate
- Verify proxy detection accuracy
- Optimize script query patterns
- Update CEX address list if needed

**Security Review:**
- Check for unusual wallet activity
- Verify contract owner still correct
- Review excluded addresses
- Update dependencies: `npm update`

### Emergency Procedures

**If Script Crashes:**
\`\`\`bash
# Restart with PM2
pm2 restart all

# Or in Railway/Render: trigger manual restart
\`\`\`

**If Database Corrupted:**
1. Supabase auto-backups (point-in-time recovery)
2. Restore from backup:
   - Settings → Database → Backups
   - Select restore point
   - Confirm

**If Contract Exploited:**
1. DO NOT panic-renounce ownership
2. Analyze the exploit on BSCScan
3. Pause system if possible:
   \`\`\`javascript
   // No pause function, but can mitigate:
   setTaxRates(0, 0) // Disable taxes temporarily
   excludeFromTax(<attacker>, true) // Exclude attacker
   \`\`\`
4. Contact security team

---

## Appendix

### A. Network Details

**BSC Mainnet:**
- RPC: https://bsc-dataseed.binance.org/
- Chain ID: 56
- Explorer: https://bscscan.com
- PancakeSwap Router: 0x10ED43C718714eb63d5aA57B78B54704E256024E
- WBNB: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

**BSC Testnet:**
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
- Chain ID: 97
- Explorer: https://testnet.bscscan.com
- PancakeSwap Router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
- WBNB: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd

### B. Useful Commands

**Check script status:**
\`\`\`bash
pm2 status
pm2 logs infection-tracker
pm2 logs reflection-monitor
\`\`\`

**Database queries:**
\`\`\`sql
-- Total holders
SELECT COUNT(*) FROM holders;

-- Top 10 holders
SELECT holder_address, balance FROM holders ORDER BY CAST(balance AS NUMERIC) DESC LIMIT 10;

-- Recent snapshots
SELECT * FROM snapshots ORDER BY taken_at DESC LIMIT 10;

-- Proxy detection stats
SELECT holder_address, COUNT(*) as proxy_count FROM proxy_wallets GROUP BY holder_address;
\`\`\`

**Contract read functions:**
- `balanceOf(address)`
- `baseBalanceOf(address)`
- `reflectionBalanceOf(address)`
- `getAntiSniperStatus()`
- `getCurrentTaxRate()`
- `maxTransactionAmount()`
- `maxWalletAmount()`

**Contract write functions (owner only):**
- `setAntiSniper(bool, uint256, uint256)`
- `setTaxRates(uint256, uint256)`
- `setMaxTransaction(uint256)`
- `setMaxWallet(uint256)`
- `excludeFromTax(address, bool)`
- `excludeFromLimits(address, bool)`
- `takeSnapshot()`
- `distributeReflections(address[], uint256[])`

### C. Support Resources

- BSC Developer Docs: https://docs.bnbchain.org/
- PancakeSwap Docs: https://docs.pancakeswap.finance/
- Supabase Docs: https://supabase.com/docs
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/

---

**END OF DEPLOYMENT GUIDE**

This guide is designed to be comprehensive and step-by-step. Follow each phase sequentially for successful deployment. If you encounter issues not covered in troubleshooting, check the script logs and database for detailed error messages.
