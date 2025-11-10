-- Add missing columns to holders table
ALTER TABLE holders
ADD COLUMN IF NOT EXISTS base_balance BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reflection_balance BIGINT DEFAULT 0;

-- Update existing holders to have their balance split into base
UPDATE holders
SET base_balance = balance
WHERE base_balance = 0;

-- Add missing column to infections table
ALTER TABLE infections
ADD COLUMN IF NOT EXISTS block_number BIGINT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_holders_balance ON holders(balance);
CREATE INDEX IF NOT EXISTS idx_holders_locked ON holders(locked);
CREATE INDEX IF NOT EXISTS idx_infections_infector ON infections(infector_address);
CREATE INDEX IF NOT EXISTS idx_infections_infected ON infections(infected_address);
CREATE INDEX IF NOT EXISTS idx_infections_block ON infections(block_number);
CREATE INDEX IF NOT EXISTS idx_proxy_wallets_holder ON proxy_wallets(holder_address);
CREATE INDEX IF NOT EXISTS idx_distributions_snapshot ON distributions(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_distributions_recipient ON distributions(recipient_address);

COMMENT ON COLUMN holders.base_balance IS 'Base token balance (from minting/purchases)';
COMMENT ON COLUMN holders.reflection_balance IS 'Reflection tokens received from distributions';
COMMENT ON COLUMN infections.block_number IS 'Block number when infection occurred';
