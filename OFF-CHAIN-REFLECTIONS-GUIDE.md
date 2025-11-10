# Off-Chain Reflection System

## Overview

The Contagion token uses a **hybrid off-chain/on-chain reflection system** to minimize gas costs while maintaining transparency and security.

## How It Works

### 1. Tax Collection (On-Chain)
- When users trade on PancakeSwap, a 6% tax is collected:
  - 5% goes to the reflection pool
  - 1% goes to the gas pool
- This happens automatically on every DEX trade

### 2. Proxy Detection (Off-Chain)
The monitoring script (`monitor-reflections.ts`) scans wallet transaction history to detect proxy wallets:
- **Pre-purchase proxies**: Last 2 outgoing transactions before token purchase (30-day lookback)
- **Post-purchase proxies**: First 2 outgoing transactions after purchase (7-day monitoring)
- Filters out CEX deposits and contract addresses
- All detection happens off-chain to save gas

### 3. Snapshot Trigger (On-Chain)
When the reflection pool reaches 1% of total supply:
- The `takeSnapshot()` function is called on-chain
- This locks the current pool balance
- A snapshot ID is created
- The amount is recorded in the database

### 4. Distribution Calculation (Off-Chain)
The script calculates distributions completely off-chain:
- Gets all eligible holders (locked, with proxies, minimum balance)
- Calculates each holder's proportional share
- Divides each holder's share equally among their proxy wallets
- **Saves virtual balances to database only** (no blockchain transaction)

### 5. Virtual Balance Tracking (Off-Chain)
Reflection amounts are stored in the `virtual_reflection_balance` column:
- Tracked entirely in the Supabase database
- No on-chain transactions = zero gas costs
- Users can view their unclaimed reflections in the dashboard
- Accumulates over multiple snapshots

### 6. User Claims (On-Chain, User-Initiated)
When users want to receive their reflections:
- Click "Claim Reflections" button in dashboard
- One transaction sends all accumulated reflections
- Virtual balance resets to zero
- Tokens transfer from reflection pool to user's wallet
- **User pays the gas fee, not the protocol**

## Benefits

### Gas Efficiency
- No gas costs for distribution calculations
- No gas for proxy detection
- Protocol only pays gas for snapshots
- Users pay gas only when claiming (their choice)

### Transparency
- All virtual balances visible in database
- On-chain snapshot events for verification
- Claim transactions recorded on blockchain
- Users can verify calculations

### Security
- On-chain tax collection (trustless)
- On-chain snapshot locking (immutable)
- Off-chain calculations (verifiable via database)
- On-chain claim execution (secured by contract)

## Database Schema

### holders table
\`\`\`sql
virtual_reflection_balance NUMERIC DEFAULT 0
-- Stores accumulated off-chain reflections
-- Updated by monitor script after each snapshot distribution
-- Reset to 0 after successful claim
\`\`\`

### reflection_claims table
\`\`\`sql
holder_address VARCHAR(42)
amount NUMERIC
transaction_hash VARCHAR(66)
claimed_at TIMESTAMP
status VARCHAR(20)
-- Records every claim transaction
-- Provides audit trail
\`\`\`

## User Experience

1. **Automatic Accumulation**: Reflections accumulate automatically without any user action
2. **Dashboard Display**: Users see their unclaimed reflections in real-time
3. **One-Click Claim**: Simple button to claim all accumulated reflections
4. **Gas Control**: Users choose when to claim based on gas prices
5. **Batch Claims**: Can wait to accumulate larger amounts before claiming

## Comparison

### Traditional On-Chain Reflections
- ❌ High gas costs for every distribution
- ❌ Protocol pays all gas fees
- ❌ Frequent small distributions
- ✅ Immediate balance updates

### Off-Chain Reflections (Contagion)
- ✅ Zero gas for distribution calculations
- ✅ Users pay their own claim gas
- ✅ Accumulate and claim in bulk
- ✅ Transparent database tracking
- ❌ Requires claim transaction (user action)

## Security Considerations

1. **Trust in Database**: Virtual balances stored off-chain require trust in the database
2. **Mitigation**: 
   - On-chain snapshot events provide checkpoints
   - Open-source monitoring script
   - Public Supabase queries
   - On-chain claim verification

3. **Admin Key Security**: The claim API uses admin private key
4. **Mitigation**:
   - Environment variable protection
   - Rate limiting on API
   - Claim history audit trail

## Monitoring

### Script Status
\`\`\`bash
# Check if monitor is running
npx tsx scripts/monitor-reflections.ts

# Should show:
# - Pool balance checks
# - Snapshot triggers
# - Off-chain distributions
# - Virtual balance updates
\`\`\`

### Database Queries
\`\`\`sql
-- Check total unclaimed reflections
SELECT SUM(virtual_reflection_balance::numeric) 
FROM holders;

-- Check user's virtual balance
SELECT virtual_reflection_balance 
FROM holders 
WHERE holder_address = '0x...';

-- View claim history
SELECT * FROM reflection_claims 
ORDER BY claimed_at DESC 
LIMIT 10;
\`\`\`

## API Endpoints

### GET /api/user-stats?address=0x...
Returns user stats including `virtual_reflection_balance`

### POST /api/claim-reflections
Claims accumulated reflections for connected wallet
- Body: `{ address: "0x..." }`
- Returns: `{ success: true, amount: "...", txHash: "..." }`
