-- CreateTable
CREATE TABLE "UserOption" (
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "key"),
    CONSTRAINT "UserOption_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
