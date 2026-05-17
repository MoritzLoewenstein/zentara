-- CreateTable
CREATE TABLE "Option" (
    "key" TEXT NOT NULL,
    "value" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Option_key_key" ON "Option"("key");
