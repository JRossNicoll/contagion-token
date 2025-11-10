# Next Steps - Getting Your Contagion Token System Live

## ✅ Completed
- [x] Database schema set up (all tables, views, indexes)
- [x] Contract deployed: `0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47`
- [x] Contract address configured in system
- [x] Frontend UI built with live data integration

## 🚀 Next Steps (Do in Order)

### Step 1: Add Environment Variables to Vercel

Go to your Vercel project settings and add these environment variables:

\`\`\`bash
# REQUIRED - Already set via integration
NEXT_PUBLIC_SUPABASE_URL=your_value_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value_here
SUPABASE_SERVICE_ROLE_KEY=your_value_here

# REQUIRED - Add these now
CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3d83CB630C3D5E53C9558d39F2e35e94E3609A47

# REQUIRED - For monitoring scripts (add your values)
RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=your_reflection_pool_private_key_here
\`\`\`

**Where to find these:**
- `RPC_URL`: Use BSC public RPC or get your own from QuickNode/Alchemy
  - BSC Mainnet: `https://bsc-dataseed.binance.org/`
  - BSC Testnet: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- `PRIVATE_KEY`: The private key of your **reflection pool wallet** (used in deployment)

### Step 2: Deploy Frontend to Vercel

Your frontend is ready to deploy:

\`\`\`bash
# If not already deployed, push to GitHub and connect to Vercel
# Or use Vercel CLI
vercel --prod
\`\`\`

After deployment, your dashboard will be live at your Vercel URL.

### Step 3: Set Up Monitoring Scripts

The monitoring scripts need to run continuously to track infections and distribute reflections.

**Option A: Run Locally (Testing)**
\`\`\`bash
# Terminal 1 - Track infections
tsx scripts/track-infections.ts

# Terminal 2 - Monitor reflections
tsx scripts/monitor-reflections.ts
\`\`\`

**Option B: Deploy to Server (Production)**

Deploy scripts to a server that runs 24/7:

**Using Railway.app:**
1. Create new project on Railway
2. Connect your GitHub repo
3. Set environment variables (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, Supabase vars)
4. Add start command: `tsx scripts/track-infections.ts & tsx scripts/monitor-reflections.ts`

**Using Render.com:**
1. Create new "Background Worker"
2. Connect repo
3. Set environment variables
4. Start command: `tsx scripts/track-infections.ts`
5. Create second worker for `monitor-reflections.ts`

**Using PM2 (VPS/Dedicated Server):**
\`\`\`bash
pm2 start scripts/track-infections.ts --name contagion-tracker --interpreter tsx
pm2 start scripts/monitor-reflections.ts --name contagion-monitor --interpreter tsx
pm2 save
pm2 startup
\`\`\`

### Step 4: Test the System

Once scripts are running, test the complete flow:

1. **Make a Test Transaction**
   - Send some CONTAGION tokens to another address
   - This should trigger the infection tracking

2. **Check Database**
   - Go to Supabase dashboard
   - Check `infections` table - should see new entries
   - Check `holders` table - should see updated balances

3. **Check Frontend**
   - Visit your dashboard at `/dashboard`
   - Connect your wallet
   - Should see your infection stats
   - Check the map at `/map` - should see network visualization

4. **Check Reflections**
   - After a few transactions, the reflection pool should accumulate
   - Monitor script will distribute when threshold is met
   - Check `distributions` table for records

### Step 5: Monitor & Verify

**Check Logs:**
\`\`\`bash
# If running locally
# Check terminal output for any errors

# If using PM2
pm2 logs contagion-tracker
pm2 logs contagion-monitor

# If using Railway/Render
# Check logs in their dashboard
\`\`\`

**What to Look For:**
- ✅ "Transaction detected" messages
- ✅ "Holder updated" messages
- ✅ "Snapshot taken" messages
- ✅ "Distribution executed" messages
- ❌ Any error messages about RPC connection
- ❌ Database insertion errors

### Step 6: Production Checklist

Before going fully live:

- [ ] Contract verified on BSCScan
- [ ] All environment variables set correctly
- [ ] Monitoring scripts running on production server
- [ ] Frontend deployed and accessible
- [ ] Test transactions completed successfully
- [ ] Dashboard showing real-time data
- [ ] Network map displaying correctly
- [ ] No errors in script logs
- [ ] Database receiving updates
- [ ] Reflection distributions working

## 🔧 Troubleshooting

### Scripts Not Tracking Transactions
- Check RPC_URL is correct and accessible
- Verify CONTRACT_ADDRESS matches deployed contract
- Ensure Supabase credentials are correct
- Check if wallet has BNB for gas

### Dashboard Showing No Data
- Verify API routes are working (check browser console)
- Check Supabase connection in API routes
- Ensure environment variables are set in Vercel
- Redeploy frontend if env vars were just added

### Reflections Not Distributing
- Check if reflection pool has accumulated enough tokens
- Verify PRIVATE_KEY is for the reflection pool wallet
- Ensure wallet has BNB for gas fees
- Check `SNAPSHOT_THRESHOLD` in environment variables

## 📊 Monitoring Dashboard URLs

Once deployed, you can access:
- **Homepage**: `https://your-app.vercel.app`
- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **Network Map**: `https://your-app.vercel.app/map`

## 🎯 What's Working Now

Your system is fully built and ready to operate:

1. ✅ Smart contract deployed with all features
2. ✅ Database fully configured
3. ✅ Monitoring scripts ready
4. ✅ Frontend UI complete
5. ✅ API routes functional
6. ✅ Wallet connection integrated

**You just need to:**
1. Add environment variables to Vercel
2. Deploy the monitoring scripts to a server
3. Test the complete flow

That's it! Your Contagion Token ecosystem will be fully operational.

---

**Current Status:** 🟡 Ready for deployment - Just need to run monitoring scripts

**Next Action:** Add the environment variables listed in Step 1, then start the monitoring scripts in Step 3.
