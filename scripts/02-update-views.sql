-- Drop old views if they exist
DROP VIEW IF EXISTS holder_statistics CASCADE;
DROP VIEW IF EXISTS distribution_summary CASCADE;

-- Recreate holder_statistics view with correct columns
CREATE OR REPLACE VIEW holder_statistics AS
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
FROM holders h
LEFT JOIN distributions d ON d.recipient_address = h.holder_address
GROUP BY h.holder_address, h.balance, h.base_balance, h.reflection_balance, h.proxy_count, h.locked, h.first_seen_time;

-- Recreate distribution_summary view with correct columns
CREATE OR REPLACE VIEW distribution_summary AS
SELECT 
  s.snapshot_id,
  s.amount as snapshot_amount,
  s.taken_at,
  s.distributed_at,
  s.status,
  s.distribution_tx,
  COALESCE(SUM(d.amount), 0) as total_distributed,
  COUNT(DISTINCT d.recipient_address) as unique_recipients,
  COUNT(d.id) as total_distributions
FROM snapshots s
LEFT JOIN distributions d ON d.snapshot_id = s.snapshot_id
GROUP BY s.snapshot_id, s.amount, s.taken_at, s.distributed_at, s.status, s.distribution_tx;

COMMENT ON VIEW holder_statistics IS 'Aggregated holder data with reflection statistics';
COMMENT ON VIEW distribution_summary IS 'Aggregated snapshot distribution statistics';
