CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_invites (
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_recovery_codes (
    user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    PRIMARY KEY (user_id, code),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dashboards (
    user_id TEXT NOT NULL PRIMARY KEY,
    config TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);