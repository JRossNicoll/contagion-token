# Sell Troubleshooting Guide

## Common Reasons Why Sells Fail

### 1. **Transaction Limits**
- Max transaction: **20 million tokens (2%)**
- If you're trying to sell more than this, split into multiple transactions
- Wait a few blocks between transactions

### 2. **Anti-Bot Protection**
- Maximum **3 sells per block**
- If you sell too fast, wait for the next block (~3 seconds)

### 3. **Wrong Router Address**
The contract recognizes this router: Check with diagnostic script

**For Testnet:** Use PancakeSwap Testnet Router:
- `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`

### 4. **Slippage Too Low**
The token has a **6% tax** (5% reflection + 1% gas)
- Set slippage to at least **10-12%** on PancakeSwap
- For safety, use **15%**

### 5. **Insufficient BNB for Gas**
You need BNB to pay for transaction fees
- Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart

## How to Diagnose Your Issue

Run the diagnostic script:

\`\`\`bash
# Edit the script and add your wallet address
nano scripts/diagnose-sell-issue.ts

# Replace 'WALLET_TO_CHECK' with your actual wallet address

# Run the diagnostic
npx tsx scripts/diagnose-sell-issue.ts
\`\`\`

## Solutions

### If balance exceeds max transaction:
\`\`\`
Sell in batches of 20 million tokens or less
Wait 1-2 blocks between sells
\`\`\`

### If hitting anti-bot limits:
\`\`\`
Wait 10-15 seconds between sell attempts
Max 3 sells per block
\`\`\`

### If slippage issues:
\`\`\`
On PancakeSwap, click settings icon
Set slippage to 12-15%
Try transaction again
\`\`\`

### If using wrong router:
\`\`\`
Use PancakeSwap Testnet only
Router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
\`\`\`

## Owner Commands to Help

If you're the contract owner, you can:

1. **Remove limits entirely:**
```solidity
contract.removeLimits()
