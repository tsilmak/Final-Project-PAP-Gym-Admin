/*
  Warnings:

  - You are about to drop the column `seen` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "seen",
ADD COLUMN     "cloudinaryPublicId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastSeen";
