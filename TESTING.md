# Testing Guide

## Pre-Deployment Testing

### 1. Smart Contract Testing

Test on BSC Testnet first:

\`\`\`bash
# Deploy to testnet
# BSC Testnet RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
# Testnet Explorer: https://testnet.bscscan.com/
\`\`\`

**Test Cases:**
- ✅ Deploy contract successfully
- ✅ Mint total supply to owner
- ✅ Transfer tokens (with tax)
- ✅ Check reflection pool accumulation
- ✅ Set proxy wallets for holder
- ✅ Take snapshot manually
- ✅ Distribute reflections
- ✅ Verify proxy wallets receive tokens

### 2. Database Testing

\`\`\`sql
-- Test holder insert
INSERT INTO holders (holder_address, balance, first_seen_block, first_seen_time, proxy_count, locked)
VALUES ('0x1234...', 1000000000000, 12345, NOW(), 0, false);

-- Test proxy insert
INSERT INTO proxy_wallets (holder_address, proxy_address, proxy_type, transaction_hash)
VALUES ('0x1234...', '0x5678...', 'pre_purchase', '0xabcd...');

-- Test views
SELECT * FROM holder_statistics;
SELECT * FROM distribution_summary;

-- Test snapshot insert
INSERT INTO snapshots (snapshot_id, amount, taken_at, status)
VALUES (1, 10000000000000, NOW(), 'pending');
\`\`\`

### 3. Monitoring Script Testing

\`\`\`bash
# Test with dry-run mode
# Modify scripts to add DRY_RUN flag

# Run test system check
npx tsx scripts/test-system.ts
\`\`\`

## Post-Deployment Testing

### Phase 1: Contract Verification

\`\`\`javascript
// Test contract functions
const { ethers } = require("ethers")

const provider = new ethers.JsonRpcProvider(RPC_URL)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)

// 1. Check total supply
const supply = await contract.TOTAL_SUPPLY()
console.log("Total Supply:", ethers.formatUnits(supply, 9))

// 2. Check owner
const owner = await contract.owner()
console.log("Owner:", owner)

// 3. Check pool addresses
const reflectionPool = await contract.reflectionPool()
const gasPool = await contract.gasPool()
console.log("Reflection Pool:", reflectionPool)
console.log("Gas Pool:", gasPool)

// 4. Check balances
const ownerBalance = await contract.balanceOf(owner)
console.log("Owner Balance:", ethers.formatUnits(ownerBalance, 9))
\`\`\`

### Phase 2: Small Test Purchase

1. Buy 1000 tokens via DEX
2. Check transaction on BSCScan:
   - ✅ Tax deducted (6%)
   - ✅ Reflection pool increased
   - ✅ Tokens received

3. Check database:
   \`\`\`sql
   SELECT * FROM holders WHERE holder_address = '<your_address>';
   SELECT * FROM infections WHERE infected_address = '<your_address>';
   \`\`\`

### Phase 3: Proxy Detection Test

After test purchase:

1. Make 2 outgoing transactions to different wallets
2. Wait 1 scan interval (30 seconds)
3. Check proxy_wallets table:
   \`\`\`sql
   SELECT * FROM proxy_wallets WHERE holder_address = '<your_address>';
   \`\`\`
4. Verify proxies detected as "post_purchase"

### Phase 4: Snapshot Test

Manually trigger snapshot:

\`\`\`javascript
// Using owner wallet
const signer = new ethers.Wallet(PRIVATE_KEY, provider)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

const tx = await contract.takeSnapshot()
const receipt = await tx.wait()
console.log("Snapshot taken:", receipt.hash)
\`\`\`

Check database:
\`\`\`sql
SELECT * FROM snapshots ORDER BY snapshot_id DESC LIMIT 1;
\`\`\`

### Phase 5: Distribution Test

Wait for automatic distribution or trigger manually:

\`\`\`javascript
// Get distribution data
const holders = await getHolders() // From script
const { recipients, amounts } = await calculateDistributions(snapshotId)

// Execute distribution
const tx = await contract.distributeReflections(recipients, amounts)
await tx.wait()
console.log("Distribution complete:", tx.hash)
\`\`\`

Check proxy wallet balances:
\`\`\`javascript
for (const proxy of proxyAddresses) {
  const balance = await contract.balanceOf(proxy)
  console.log(`${proxy}: ${ethers.formatUnits(balance, 9)} tokens`)
}
\`\`\`

## Automated Testing

### Unit Tests (Jest)

\`\`\`bash
npm install --save-dev jest @types/jest ts-jest

# Create test file: __tests__/distribution.test.ts
\`\`\`

\`\`\`typescript
describe('Distribution Calculation', () => {
  it('should calculate distributions correctly', () => {
    const holders = [
      { address: '0x1', balance: 1000n, proxies: ['0xa', '0xb'] },
      { address: '0x2', balance: 500n, proxies: ['0xc', '0xd'] }
    ]
    const snapshotAmount = 150n
    const totalBalance = 1500n
    
    // Holder 1: 1000/1500 * 150 = 100 total, 50 per proxy
    // Holder 2: 500/1500 * 150 = 50 total, 25 per proxy
    
    expect(calculateForHolder(holders[0], snapshotAmount, totalBalance)).toBe(50n)
    expect(calculateForHolder(holders[1], snapshotAmount, totalBalance)).toBe(25n)
  })
})
\`\`\`

### Integration Tests

\`\`\`bash
# Create integration test script
npx tsx scripts/integration-test.ts
\`\`\`

Test full workflow:
1. Deploy contract (testnet)
2. Add liquidity
3. Make purchase
4. Wait for proxy detection
5. Trigger snapshot
6. Execute distribution
7. Verify results

## Performance Testing

### Load Test: Multiple Holders

\`\`\`javascript
// Simulate 1000 holders
for (let i = 0; i < 1000; i++) {
  await supabase.from("holders").insert({
    holder_address: generateRandomAddress(),
    balance: randomBalance(),
    first_seen_block: currentBlock,
    first_seen_time: new Date().toISOString(),
    proxy_count: 4,
    locked: true
  })
}

// Test distribution calculation time
const start = Date.now()
const result = await calculateDistributions(snapshotId)
const end = Date.now()
console.log(`Calculated distributions for 1000 holders in ${end - start}ms`)
\`\`\`

### Stress Test: Large Distributions

\`\`\`javascript
// Test with maximum recipients (100 per batch)
const recipients = Array(100).fill(0).map(() => generateRandomAddress())
const amounts = Array(100).fill(1000000000n) // 1 token each

const tx = await contract.distributeReflections(recipients, amounts)
const receipt = await tx.wait()
console.log("Gas used:", receipt.gasUsed.toString())
\`\`\`

## Monitoring Testing

### Test Script Health Checks

\`\`\`bash
# Check if scripts are running
ps aux | grep "monitor-reflections"
ps aux | grep "track-infections"

# Check recent logs
tail -f script_logs.txt

# Monitor database writes
watch -n 1 'psql -c "SELECT COUNT(*) FROM script_logs WHERE created_at > NOW() - INTERVAL '\''1 minute'\''"'
\`\`\`

## Security Testing

### 1. Anti-Bot Protection

\`\`\`javascript
// Test max sells per block
for (let i = 0; i < 5; i++) {
  try {
    const tx = await contract.transfer(DEX_ROUTER, amount)
    await tx.wait()
    console.log(`Sell ${i + 1}: Success`)
  } catch (error) {
    console.log(`Sell ${i + 1}: Failed - ${error.message}`)
    // Should fail after 3 sells in same block
  }
}
\`\`\`

### 2. Transaction Limits

\`\`\`javascript
// Test max transaction amount (2% of supply)
const maxTx = totalSupply * 2n / 100n
const overMaxTx = maxTx + 1n

try {
  await contract.transfer(recipient, overMaxTx)
  console.log("❌ Should have failed - over max tx")
} catch (error) {
  console.log("✅ Max tx limit working")
}
\`\`\`

### 3. Reentrancy Protection

\`\`\`solidity
// Deploy malicious contract that attempts reentrancy
// Should fail due to ReentrancyGuard
\`\`\`

## Test Checklist

- [ ] Contract deploys successfully
- [ ] Total supply correct (1B tokens)
- [ ] Tax system working (5% reflection, 1% gas)
- [ ] Anti-bot protection active
- [ ] Transaction limits enforced
- [ ] Holder tracking active
- [ ] Proxy detection working
- [ ] Snapshot triggering correctly
- [ ] Distribution calculation accurate
- [ ] On-chain distribution successful
- [ ] Dashboard displays data
- [ ] API endpoints responding
- [ ] Script logs being written
- [ ] Error handling working
- [ ] Gas optimization acceptable

## Troubleshooting Common Issues

### Issue: Proxies Not Detected
- Check transaction history exists
- Verify timestamps within scan windows
- Check filters (contract/CEX detection)

### Issue: Distribution Fails
- Verify wallet has gas
- Check pool has enough balance
- Ensure holders have proxies set

### Issue: Script Not Running
- Check environment variables
- Verify RPC endpoint accessible
- Check database connection

### Issue: Dashboard No Data
- Verify API routes deployed
- Check Supabase connection
- Ensure data exists in tables
\`\`\`
