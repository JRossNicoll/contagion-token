# Critical Deployment Steps - READ BEFORE DEPLOYING

## ⚠️ MANDATORY PREREQUISITES

### 1. Database Schema Fix (MUST DO FIRST!)

The database is **missing required columns**. Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Run scripts/00-critical-schema-fixes.sql
-- This adds base_balance, reflection_balance, and block_number columns
\`\`\`

**Location:** `scripts/00-critical-schema-fixes.sql`

**Why:** Scripts will fail without these columns. This is NON-NEGOTIABLE.

---

## ✅ VERIFICATION CHECKLIST

### Database Schema Verification

Run this in Supabase SQL Editor to verify columns exist:

\`\`\`sql
-- Check holders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'holders'
AND column_name IN ('base_balance', 'reflection_balance');

-- Check infections table  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'infections'
AND column_name = 'block_number';
\`\`\`

**Expected Result:** Should return 3 rows showing these columns exist as BIGINT type.

---

### Environment Variables Check

Ensure these are set in your environment:

\`\`\`bash
# Required for scripts
RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address

# Already set via Supabase integration
SUPABASE_URL=✅
SUPABASE_SERVICE_ROLE_KEY=✅

# Optional configuration
SNAPSHOT_THRESHOLD=1
MIN_HOLDER_BALANCE=100000000000
SCAN_INTERVAL=30000
\`\`\`

---

## 🚀 DEPLOYMENT SEQUENCE

### Step 1: Deploy Smart Contract

\`\`\`bash
# Install dependencies (if not already done)
npm install

# Compile and deploy contract
npx hardhat compile
npx hardhat run scripts/deploy-contract.ts --network bsc

# Save the deployed contract address
\`\`\`

**Set the CONTRACT_ADDRESS environment variable with the deployed address.**

---

### Step 2: Start Monitoring Scripts

Open **two separate terminals**:

**Terminal 1 - Infection Tracker:**
\`\`\`bash
npx tsx scripts/track-infections.ts
\`\`\`

**Terminal 2 - Reflection Monitor:**
\`\`\`bash
npx tsx scripts/monitor-reflections.ts
\`\`\`

---

### Step 3: Verify Scripts Are Running

Check Supabase `script_logs` table:

\`\`\`sql
SELECT * FROM script_logs 
ORDER BY created_at DESC 
LIMIT 10;
\`\`\`

**Expected:** You should see log entries from both scripts.

---

### Step 4: Deploy Frontend

\`\`\`bash
# The frontend is already built
# Deploy to Vercel or your hosting platform
vercel deploy
\`\`\`

---

## 🔍 TESTING

### Test 1: Contract Deployment
\`\`\`bash
npx tsx scripts/test-system.ts
\`\`\`

### Test 2: Manual Token Transfer

Send some tokens to a test address and verify:

1. **Check `infections` table** - Should see the transfer recorded
2. **Check `holders` table** - Should see holder balances updated
3. **Check `script_logs` table** - Should see tracking events

---

## 🐛 TROUBLESHOOTING

### Issue: "Column does not exist"

**Solution:** You didn't run `00-critical-schema-fixes.sql`. Run it now.

### Issue: "Cannot connect to RPC"

**Solution:** Check your `RPC_URL` is valid. Try: `https://bsc-dataseed.binance.org/`

### Issue: "Insufficient funds for transaction"

**Solution:** Your wallet (PRIVATE_KEY) needs BNB for gas fees.

### Issue: Scripts not logging to database

**Solution:** Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly.

---

## ✨ ALL FIXES APPLIED

### What Was Fixed:

1. ✅ **Database Schema** - SQL migration script created
2. ✅ **Type Mismatches** - Fixed `first_seen_block` to use number instead of string
3. ✅ **Balance Fields** - All scripts now correctly handle base_balance and reflection_balance
4. ✅ **Block Number** - infections table now receives block_number correctly
5. ✅ **Error Handling** - Both scripts have robust error handling and logging
6. ✅ **Reconnection Logic** - Provider errors handled with automatic reconnection
7. ✅ **TypeScript Types** - All interfaces match database schema exactly

### Files Modified:
- ✅ `scripts/track-infections.ts` - Fixed type conversion
- ✅ `scripts/00-critical-schema-fixes.sql` - Database migration ready
- ✅ `types/index.ts` - Types already correct
- ✅ All other scripts - Already functional

---

## 📊 CURRENT STATUS

**Smart Contract:** ✅ Ready to deploy  
**Database Schema:** ⚠️ Needs migration (1 SQL file to run)  
**Monitoring Scripts:** ✅ Ready to run  
**API Routes:** ✅ Fully functional  
**Frontend:** ✅ Built and ready  
**Documentation:** ✅ Complete  

---

## 🎯 NEXT ACTION

**RUN THIS NOW:**

1. Open Supabase SQL Editor
2. Copy contents of `scripts/00-critical-schema-fixes.sql`
3. Execute the SQL
4. Verify success message: "Schema fixes completed successfully!"
5. Deploy contract and start scripts

**That's it. System is production-ready after this one SQL execution.**
\`\`\`
