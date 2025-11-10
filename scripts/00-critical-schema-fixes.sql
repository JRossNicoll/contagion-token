-- Critical schema fixes for Contagion Token system
-- Run this FIRST before running any scripts

-- 1. Add missing columns to holders table
ALTER TABLE public.holders 
ADD COLUMN IF NOT EXISTS base_balance BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reflection_balance BIGINT DEFAULT 0;

-- Update existing holders to have base_balance equal to current balance
UPDATE public.holders
SET base_balance = balance
WHERE base_balance IS NULL OR base_balance = 0;

-- 2. Add missing block_number to infections table
ALTER TABLE public.infections
ADD COLUMN IF NOT EXISTS block_number BIGINT;

-- Create index on block_number for faster queries
CREATE INDEX IF NOT EXISTS idx_infections_block_number 
ON public.infections(block_number);

-- 3. Fix first_seen_block type if needed (should already be bigint)
-- Verify the column type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'holders' 
        AND column_name = 'first_seen_block' 
        AND data_type != 'bigint'
    ) THEN
        ALTER TABLE public.holders ALTER COLUMN first_seen_block TYPE BIGINT USING first_seen_block::BIGINT;
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holders_base_balance ON public.holders(base_balance);
CREATE INDEX IF NOT EXISTS idx_holders_reflection_balance ON public.holders(reflection_balance);
CREATE INDEX IF NOT EXISTS idx_holders_locked ON public.holders(locked);
CREATE INDEX IF NOT EXISTS idx_holders_balance_desc ON public.holders(balance DESC);

-- 5. Update holder_statistics view to include new columns
DROP VIEW IF EXISTS public.holder_statistics CASCADE;

CREATE OR REPLACE VIEW public.holder_statistics AS
SELECT 
    h.holder_address,
    h.balance,
    h.base_balance,
    h.reflection_balance,
    h.proxy_count,
    h.locked,
    h.first_seen_time,
    COALESCE(SUM(d.amount), 0) as total_reflections_received,
    COUNT(d.id) as total_distributions_received
FROM public.holders h
LEFT JOIN public.distributions d ON d.recipient_address = h.holder_address
GROUP BY h.holder_address, h.balance, h.base_balance, h.reflection_balance, h.proxy_count, h.locked, h.first_seen_time;

-- Verify the changes
SELECT 'Schema fixes completed successfully!' as status;
