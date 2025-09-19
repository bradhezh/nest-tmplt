/*
  Warnings:

  - A unique constraint covering the columns `[username,name]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Item_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Item_username_name_key" ON "Item"("username", "name");
