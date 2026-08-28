/*
  Warnings:

  - A unique constraint covering the columns `[user_id,record_type,external_id]` on the table `UserRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,external_account_id]` on the table `oauth_connections` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserRecord" ADD COLUMN "external_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserRecord_user_id_record_type_external_id_key" ON "UserRecord"("user_id", "record_type", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connections_provider_external_account_id_key" ON "oauth_connections"("provider", "external_account_id");
