-- Create holder_statistics view for dashboard
CREATE OR REPLACE VIEW holder_statistics AS
SELECT 
  h.holder_address,
  h.balance,
  h.proxy_count,
  h.locked,
  COALESCE(SUM(d.amount::numeric), 0)::text as total_reflections_received
FROM holders h
LEFT JOIN distributions d ON d.recipient_address = h.holder_address
GROUP BY h.holder_address, h.balance, h.proxy_count, h.locked;

-- Create distribution_summary view for quick stats
CREATE OR REPLACE VIEW distribution_summary AS
SELECT 
  s.snapshot_id,
  SUM(d.amount::numeric)::text as total_distributed,
  COUNT(DISTINCT d.recipient_address) as recipient_count,
  s.distributed_at
FROM snapshots s
LEFT JOIN distributions d ON d.snapshot_id = s.snapshot_id
WHERE s.status = 'distributed'
GROUP BY s.snapshot_id, s.distributed_at;
