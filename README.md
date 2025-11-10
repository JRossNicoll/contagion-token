# Contagion Token

A revolutionary reflection token system with script-controlled proxy wallet distribution.

## Overview

Contagion Token implements a unique reflection mechanism where each holder has up to 4 proxy wallets that receive their share of reflection distributions. The system uses a monitoring script to scan transaction history, detect proxy wallets, and execute distributions.

## Features

- **6% Tax System**: 5% to reflection pool, 1% to gas pool
- **Proxy Wallet Detection**: Automatically finds up to 4 proxy wallets per holder
- **Snapshot-based Distribution**: Reflections distributed when pool reaches 1% of supply
- **Anti-Bot Protection**: Max 3 sells per block, transaction limits
- **Real-time Dashboard**: Monitor holders, snapshots, and infections

## Architecture

### Smart Contract (`contracts/ContagionToken.sol`)
- ERC-20 token with dual balance system (base + reflections)
- Script-controlled distribution via `distributeReflections()`
- Proxy wallet management via `setProxyWallets()`
- Snapshot system via `takeSnapshot()`

### Monitoring Script (`scripts/monitor-reflections.ts`)
- Runs continuously to monitor reflection pool
- Scans holder transaction history for proxy wallets
- Executes distributions based on snapshots
- Logs all activity to database

### Backend API (`app/api/`)
- `/api/holders` - Get holder information
- `/api/snapshots` - Get snapshot history
- `/api/stats` - Get overall statistics
- `/api/infections` - Get infection history
- `/api/infection-chain` - Get infection chain for address

### Frontend Dashboard (`app/dashboard/`)
- Real-time statistics overview
- Holders table with proxy information
- Snapshots history with distribution status
- Infections tracking

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in:

\`\`\`bash
RPC_URL=https://your-quicknode-endpoint
PRIVATE_KEY=0xyour-private-key
CONTRACT_ADDRESS=0xyour-deployed-contract
\`\`\`

### 2. Deploy Contract

\`\`\`bash
# Deploy to BSC using your preferred method (Hardhat, Foundry, etc.)
# Make sure to note the deployed contract address
\`\`\`

### 3. Run Monitoring Script

\`\`\`bash
npm run monitor
\`\`\`

### 4. Run Dashboard

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to view the dashboard.

## How It Works

### Proxy Detection

For each holder:
1. **Pre-purchase (2 proxies)**: Looks back 30 days from first token receipt, finds last 2 outgoing transactions
2. **Post-purchase (2 proxies)**: Monitors for 7 days after token receipt, finds first 2 outgoing transactions
3. Filters out contracts and CEX deposits
4. Locks holder once 4 proxies found or 7 days passed

### Distribution Formula

\`\`\`
holder_share = (holder_balance / total_supply) * snapshot_amount
amount_per_proxy = holder_share / proxy_count
\`\`\`

Each proxy receives equal share of holder's allocation.

### Snapshot Process

1. Pool reaches 1% of supply (10M tokens)
2. Script calls `takeSnapshot()` to lock current pool amount
3. Script scans holders for proxy wallets
4. Script distributes PREVIOUS snapshot while scanning current one
5. Distribution always one round behind scanning

## Database Schema

All tables managed via Supabase:
- `holders` - Token holder information
- `proxy_wallets` - Detected proxy wallets
- `snapshots` - Reflection pool snapshots
- `distributions` - Individual distribution records
- `infections` - Token transfer history
- `infection_chain` - Infection genealogy
- `script_logs` - Script activity logs

## Security

- ReentrancyGuard on all transfers
- Anti-bot: max 3 sells per block
- Transaction limits: 2% max tx, 2% max wallet
- Owner-only admin functions
- Emergency withdrawal functions

## License

MIT
