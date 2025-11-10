-- Add virtual_reflection_balance column to holders table
-- This stores off-chain reflection balances that can be claimed later

ALTER TABLE holders 
ADD COLUMN IF NOT EXISTS virtual_reflection_balance NUMERIC DEFAULT 0;

-- Create claims table to track when users withdraw their virtual reflections
CREATE TABLE IF NOT EXISTS reflection_claims (
  id BIGSERIAL PRIMARY KEY,
  holder_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_hash TEXT NOT NULL,
  claimed_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Removed foreign key constraint since holder_address needs to match the text type in holders table
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_holder ON reflection_claims(holder_address);
CREATE INDEX IF NOT EXISTS idx_claims_status ON reflection_claims(status);

-- Add comment to explain the system
COMMENT ON COLUMN holders.virtual_reflection_balance IS 'Off-chain reflection balance tracked in database only. Users must claim to receive on-chain.';
