# Contract Verification Troubleshooting

Your contract: `0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47`

## Common Causes of Verification Failure

### 1. Constructor Arguments Mismatch

**What you need to verify:**
Go to your deployment transaction on BSCScan and check what parameters you actually used.

**BSCScan Link:**
https://testnet.bscscan.com/tx/[YOUR_DEPLOYMENT_TX_HASH]

Look at the "Input Data" section to see the encoded constructor arguments.

**Your constructor parameters should be:**
\`\`\`
string name: "Contagion Token"
string symbol: "CONTAGION"
address _reflectionPool: [the address you used]
address _gasPool: [the address you used]
address _dexRouter: [the router address you used]
\`\`\`

### 2. Wrong Compiler Settings

Make sure these EXACT settings match:

- **Compiler Version**: Look at your Remix compilation output - it shows the exact version like `0.8.20+commit.a1b79de6`
- **Optimization**: Enabled with **200** runs
- **EVM Version**: default (london)

### 3. Flattened Contract Issues

The flattened contract must match EXACTLY what was deployed. Even whitespace differences can cause issues.

## Step-by-Step Fix

### Step 1: Get Your Deployment Transaction Details

Go to BSCScan and find your deployment transaction. Tell me:
1. What were the 5 constructor parameters you used?
2. What compiler version did Remix show when you compiled?

### Step 2: Generate Proper Flattened Contract

In Remix:
1. Make sure you're using the EXACT same contract code
2. Set compiler to the EXACT version you deployed with
3. Enable optimization with 200 runs
4. Click "Compile"
5. Right-click contract → "Flatten"

### Step 3: Encode Constructor Arguments Manually

If BSCScan can't auto-detect, you need to manually encode them.

**Use this tool:** https://abi.hashex.org/

**Or use this script:**

\`\`\`typescript
// In your terminal
npx tsx scripts/encode-constructor.ts
\`\`\`

Let me create that script for you...
