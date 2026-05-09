-- Add support for up to 3 portfolio slots per user.
--
-- Each row in `portfolios` keeps mirroring the ACTIVE slot's data in the
-- existing top-level columns (cash / positions / transactions / name) so the
-- leaderboard query keeps working untouched. The full set of slots lives in
-- the new `slots` JSONB column.
--
-- slots schema:
--   [
--     { "name": "Main",     "cash": 100000, "positions": {}, "transactions": [] },
--     { "name": "Aggressive","cash":  98000, "positions": {...}, "transactions": [...] },
--     ...
--   ]

ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS slots        JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS active_slot  INTEGER DEFAULT 0;
