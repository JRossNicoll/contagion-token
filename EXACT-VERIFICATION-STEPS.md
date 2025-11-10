# Exact BSCScan Verification Steps

## Step 1: Get Your Deployment Parameters

Go to your deployment transaction:
https://testnet.bscscan.com/tx/0x3d481a87990a750c6b036eb5d8fec0764cb46c51e96281e8b0b31db1cf36989f

Look for **"Input Data"** section and click **"Decode Input Data"**

You'll see something like:
\`\`\`
MethodID: 0x (constructor)
[0]: Contagion Token (string)
[1]: CONTAGION (string)
[2]: 0x... (address) - reflection pool
[3]: 0x... (address) - gas pool  
[4]: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 (address) - router
\`\`\`

**Write down these exact values!**

## Step 2: Flatten Your Contract in Remix

1. Open Remix IDE
2. Load your `ContagionToken.sol` 
3. Right-click the file → **"Flatten"**
4. A new file `ContagionToken_flattened.sol` will be created
5. Copy ALL the contents

## Step 3: Verify on BSCScan

Go to: https://testnet.bscscan.com/verifyContract?a=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47

Fill in:

### Contract Address
\`\`\`
0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
\`\`\`

### Compiler Type
\`\`\`
Solidity (Single file)
\`\`\`

### Compiler Version
**IMPORTANT**: Must match EXACTLY what you used in Remix

Check in Remix: Click "Solidity Compiler" tab and see the version

Most likely one of these:
- `v0.8.20+commit.a1b79de6`
- `v0.8.20+commit.a1b79de`

### Open Source License Type
\`\`\`
3) MIT License (MIT)
\`\`\`

### Optimization
\`\`\`
Yes
\`\`\`

### Runs (Optimizer)
\`\`\`
200
\`\`\`

## Step 4: Enter Contract Code

Paste the **flattened contract** from Remix

## Step 5: Constructor Arguments ABI-encoded

**Option A: Let BSCScan Auto-Detect (Recommended)**
- Leave this field **BLANK**
- BSCScan will automatically detect from your deployment transaction
- This is the easiest and most reliable method

**Option B: Manual Encoding (If auto-detect fails)**

Use this tool: https://abi.hashex.org/

Select:
- Function Type: `constructor`
- Add parameters:
  1. `name` (string): "Contagion Token"
  2. `symbol` (string): "CONTAGION"  
  3. `_reflectionPool` (address): Your reflection pool address
  4. `_gasPool` (address): Your gas pool address
  5. `_dexRouter` (address): 0xD99D1c33F9fC3444f8101754aBC46c51e96281e8b0b31db1cf36989f

Click "Encode" and copy the result (long hex string)

## Step 6: Verify & Publish

Click **"Verify and Publish"**

If successful, you'll see:
\`\`\`
✅ Contract Source Code Verified Successfully
\`\`\`

## Common Errors and Fixes

### Error: "Bytecode Mismatch"
**Cause**: Compiler version doesn't match
**Fix**: Try different v0.8.20 variants in the dropdown

### Error: "Constructor Arguments Invalid"  
**Cause**: Wrong ABI encoding
**Fix**: Leave constructor arguments blank and let BSCScan auto-detect

### Error: "Compilation Failed"
**Cause**: Wrong optimization settings
**Fix**: Make sure Optimization is "Yes" with 200 runs

## After Verification

Your contract page will show:
- ✅ Green checkmark next to contract address
- "Contract" tab with readable source code
- "Read Contract" tab for viewing state
- "Write Contract" tab for interacting

This builds trust with users and allows direct interaction through BSCScan.
