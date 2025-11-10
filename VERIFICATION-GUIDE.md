# Contract Verification Guide

Your contract address: `0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47`

## Quick Verification (Recommended)

### Step 1: Get BSCScan API Key
1. Go to https://bscscan.com/register
2. Create account and verify email
3. Go to https://bscscan.com/myapikey
4. Create new API key
5. Add to `.env.local`:
   \`\`\`
   BSCSCAN_API_KEY=your_api_key_here
   \`\`\`

### Step 2: Update Constructor Arguments

In `scripts/verify-contract.ts`, replace the placeholder values:
\`\`\`typescript
[REFLECTION_POOL] // Your reflection pool address
[GAS_POOL] // Your gas pool address  
[DEX_ROUTER] // PancakeSwap router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
\`\`\`

### Step 3: Run Verification

\`\`\`bash
npx tsx scripts/verify-contract.ts
\`\`\`

---

## Manual Verification (If Automated Fails)

### Step 1: Flatten Contract in Remix

1. Open Remix IDE: https://remix.ethereum.org
2. Create new file: `ContagionToken.sol`
3. Paste your contract code
4. Right-click on the file → **"Flatten"**
5. Copy the flattened code

### Step 2: Verify on BSCScan

1. Go to: https://testnet.bscscan.com/address/0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47#code
2. Click **"Verify and Publish"**
3. Fill in details:

**Verification Form:**
\`\`\`
Contract Address: 0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
Compiler Type: Solidity (Single file)
Compiler Version: v0.8.20+commit.a1b79de6
License Type: MIT License
\`\`\`

**Optimization Settings:**
\`\`\`
Optimization: Yes
Runs: 200
\`\`\`

**Contract Code:**
- Paste the flattened contract code from Remix

**Constructor Arguments:**
BSCScan should auto-detect these from your deployment transaction. If not:
1. Go to https://abi.hashex.org/
2. Select constructor parameters:
   - string: "Contagion Token"
   - string: "CONTAGION"
   - address: [your reflection pool address]
   - address: [your gas pool address]
   - address: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
3. Copy the ABI-encoded result
4. Paste into "Constructor Arguments" field

### Step 3: Submit

Click **"Verify and Publish"**

If successful, you'll see a green checkmark and the contract code will be readable on BSCScan.

---

## Troubleshooting

**Error: "Bytecode does not match"**
- Make sure optimization is set to Yes with 200 runs
- Verify you're using compiler version 0.8.20 exactly
- Ensure constructor arguments are correctly encoded

**Error: "Invalid constructor arguments"**
- Let BSCScan auto-detect from deployment transaction
- Or use ABI encoder: https://abi.hashex.org/

**Error: "Compilation failed"**
- Make sure the flattened code is complete
- Check that all SPDX licenses match (should all be MIT)

**Already Verified**
- Great! Nothing to do. View at: https://testnet.bscscan.com/address/0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47#code

---

## After Verification

Once verified, users can:
- Read contract functions on BSCScan
- See source code and comments
- Interact with contract directly via BSCScan
- Verify security before trading
- Build trust in your project

**Mainnet Verification:**
Same process, but use https://bscscan.com instead of testnet.
