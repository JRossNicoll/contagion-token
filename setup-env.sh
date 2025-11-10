#!/bin/bash

echo "=== Contagion Token Environment Setup ==="
echo ""
echo "This script will help you create your .env.local file"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Backup created as .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Contract Configuration
CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47

# BSC Configuration
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
EOF

echo "✅ Created .env.local template"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase project: https://supabase.com/dashboard"
echo "2. Click 'Project Settings' > 'API'"
echo "3. Copy these values into .env.local:"
echo "   - Project URL → NEXT_PUBLIC_SUPABASE_URL"
echo "   - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - service_role key → SUPABASE_SERVICE_ROLE_KEY"
echo "4. Add your reflection pool wallet PRIVATE_KEY"
echo ""
echo "Then run: npx tsx scripts/track-infections.ts"
