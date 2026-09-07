USE imtrack_db;

-- Akun lokal untuk mencoba endpoint sebelum autentikasi diimplementasikan.
-- Nilai user_id harus sama dengan DEFAULT_USER_ID pada .env.
INSERT INTO users (
  user_id,
  username,
  email,
  password_hash,
  display_name
) VALUES (
  1,
  'demo',
  'demo@imtrack.local',
  'not-used-for-login',
  'Demo User'
)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name);
