# Deployment Guide

## Prerequisites

- Node.js 18+
- Vercel account
- Supabase project (already configured)
- BSC wallet with BNB for gas
- BSC RPC endpoint

## Step 1: Smart Contract Deployment

### Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new file: `ContagionToken.sol`
3. Paste contract code from `contracts/ContagionToken.sol`
4. Install dependencies (if needed):
   - @openzeppelin/contracts ^5.0.0

5. Compile contract:
   - Compiler: 0.8.20
   - Optimization: Enabled, 200 runs

6. Deploy to BSC:
   - Network: BSC Mainnet (ChainID: 56)
   - Constructor params:
     - name: "Contagion"
     - symbol: "CONTG"
     - reflectionPool: Your reflection wallet address
     - gasPool: Your gas wallet address  
     - dexRouter: PancakeSwap Router (0x10ED43C718714eb63d5aA57B78B54704E256024E)

7. Save contract address for next steps

### Using Hardhat (Alternative)

\`\`\`bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network bsc
\`\`\`

## Step 2: Supabase Database Setup

The tables are already created. Just need to run the views:

1. Go to Supabase SQL Editor
2. Open `scripts/create-views.sql`
3. Execute the SQL script
4. Verify views created:
   - holder_statistics
   - distribution_summary

## Step 3: Configure Environment Variables

### In Vercel Project Settings

Add these environment variables:

\`\`\`
RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_address
SNAPSHOT_THRESHOLD=1
MIN_HOLDER_BALANCE=100000000000
SCAN_INTERVAL=30000
\`\`\`

Supabase vars are already configured.

## Step 4: Deploy Frontend to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
\`\`\`

Or use GitHub integration:
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

## Step 5: Run Monitoring Scripts

### Option A: Run Locally (Development)

\`\`\`bash
# Terminal 1: Infection tracker
npx tsx scripts/track-infections.ts

# Terminal 2: Reflection monitor  
npx tsx scripts/monitor-reflections.ts
\`\`\`

### Option B: Run on Server (Production)

Use PM2 for process management:

\`\`\`bash
# Install PM2
npm install -g pm2

# Start scripts
pm2 start scripts/track-infections.ts --name "infection-tracker" --interpreter="npx" --interpreter-args="tsx"
pm2 start scripts/monitor-reflections.ts --name "reflection-monitor" --interpreter="npx" --interpreter-args="tsx"

# Save and enable startup
pm2 save
pm2 startup
\`\`\`

### Option C: Run on Cloud (Recommended)

Deploy scripts to Railway, Render, or DigitalOcean:

**Railway:**
1. Create new project
2. Add service from GitHub repo
3. Set environment variables
4. Add start command: `npx tsx scripts/monitor-reflections.ts`
5. Deploy

**Render:**
1. Create new Background Worker
2. Connect GitHub repo
3. Build command: `npm install`
4. Start command: `npx tsx scripts/monitor-reflections.ts`
5. Add environment variables
6. Deploy

## Step 6: Initial Contract Setup

After deployment, configure the contract:

\`\`\`javascript
// Using ethers.js
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

// Set tax rates (if needed)
await contract.setTaxRates(5, 1) // 5% reflection, 1% gas

// Set transaction limits
await contract.setMaxTransaction(2) // 2% max per tx
await contract.setMaxWallet(2) // 2% max wallet

// Add liquidity pool to exclusions
await contract.excludeFromLimits(LIQUIDITY_POOL_ADDRESS, true)
await contract.excludeFromTax(LIQUIDITY_POOL_ADDRESS, true)
\`\`\`

## Step 7: Verification

### Contract Verification on BSCScan

1. Go to https://bscscan.com/verifyContract
2. Enter contract address
3. Compiler: 0.8.20
4. Optimization: Yes, 200 runs
5. Paste flattened source code
6. Verify

### Test the System

1. Buy small amount of tokens
2. Check holder appears in dashboard
3. Wait for proxy scanning (check script logs)
4. Verify proxies detected in database
5. Trigger snapshot manually (if needed):
   \`\`\`javascript
   await contract.takeSnapshot()
   \`\`\`

## Step 8: Monitor

### Check Script Logs

Query `script_logs` table in Supabase:
\`\`\`sql
SELECT * FROM script_logs 
ORDER BY created_at DESC 
LIMIT 100;
\`\`\`

### Monitor Dashboard

Visit your deployed dashboard:
- Verify holder count updates
- Check snapshot creation
- Monitor distributions

### Set Up Alerts (Optional)

Create cron job to check script health:
\`\`\`bash
# Check if scripts are running
*/5 * * * * pgrep -f "track-infections" || pm2 restart infection-tracker
*/5 * * * * pgrep -f "monitor-reflections" || pm2 restart reflection-monitor
\`\`\`

## Troubleshooting

### Scripts Not Starting
- Check RPC_URL is accessible
- Verify PRIVATE_KEY format (no 0x prefix)
- Ensure CONTRACT_ADDRESS is correct

### No Holders Detected
- Verify track-infections.ts is running
- Check contract Transfer events are emitted
- Confirm Supabase connection

### Distributions Failing
- Check wallet has enough BNB for gas
- Verify reflection pool has sufficient balance
- Check holders have proxies set

## Production Checklist

- [ ] Contract deployed and verified on BSCScan
- [ ] Database views created in Supabase
- [ ] All environment variables set in Vercel
- [ ] Frontend deployed and accessible
- [ ] Monitoring scripts running (PM2/Railway/Render)
- [ ] Initial liquidity added to DEX
- [ ] Contract ownership transferred (if needed)
- [ ] Team wallets excluded from taxes/limits
- [ ] Test purchase completed successfully
- [ ] Dashboard showing live data
- [ ] Script logs being written to database
- [ ] Monitoring/alerting set up

## Post-Deployment

### Marketing Preparation
- Contract address: `<your_address>`
- BSCScan link: `https://bscscan.com/token/<address>`
- Dashboard: `https://<your-vercel-app>.vercel.app`
- PancakeSwap link: `https://pancakeswap.finance/swap?outputCurrency=<address>`

### Ongoing Maintenance
- Monitor script logs daily
- Check distribution success rate
- Update CEX addresses as needed
- Respond to community feedback
- Scale monitoring scripts if needed
\`\`\`

```env file="" isHidden
