# Quick Setup Instructions for WSL

## Fix Dependencies and Run Scripts

Run these commands in your WSL terminal:

\`\`\`bash
# Navigate to project
cd ~/contagion-token

# Install with legacy peer deps to resolve React 19 conflict
npm install --legacy-peer-deps

# Now you can run the monitoring scripts
npm run track    # Start infection tracker
npm run monitor  # Start reflection monitor

# Or run the dev server
npm run dev
\`\`\`

## Environment Variables

Make sure you have a `.env.local` file in the project root:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Contract
CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47

# BSC
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=your_reflection_pool_private_key
\`\`\`

## Quick Commands

\`\`\`bash
# Start infection tracker
npm run track

# Start reflection monitor (open new terminal)
npm run monitor

# Start dev server (open new terminal)
npm run dev
\`\`\`

All scripts will now work correctly!
