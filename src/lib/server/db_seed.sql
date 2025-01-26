-- 1) USERS
--    Columns: id (ULID), email, password
--    "id" is PRIMARY KEY, "email" is UNIQUE, both TEXT.
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0
);

-- 2) USER_INVITES
--    Columns: id (ULID), email, created_at (epoch), accepted_at (epoch)
--    "id" is PRIMARY KEY, "email" is UNIQUE.
CREATE TABLE IF NOT EXISTS user_invites (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    -- Unix epoch
    accepted_at INTEGER -- null if not accepted yet
);

-- 3) USER_RECOVERY_CODES
--    Columns: user_id (FK), code (unique), created_at (epoch), used_at (epoch)
--    "code" is UNIQUE, referencing "users.id" for user_id.
CREATE TABLE IF NOT EXISTS user_recovery_codes (
    user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    -- Unix epoch
    used_at INTEGER,
    -- null if unused
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4) SESSIONS
--    Columns: id (ULID), created_at (epoch), updated_at (epoch), user_id (FK)
--    "id" is PRIMARY KEY, referencing "users.id" for user_id.
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    -- Unix epoch
    updated_at INTEGER NOT NULL,
    -- Unix epoch
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5) DASHBOARDS
--    Columns: user_id (FK), config
--    "user_id" is PRIMARY KEY, referencing "users.id".
CREATE TABLE IF NOT EXISTS dashboards (
    user_id TEXT PRIMARY KEY,
    config TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);