/*
  Warnings:

  - You are about to drop the column `cloudinaryPublicId` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "cloudinaryPublicId",
ADD COLUMN     "cloudinaryImagePublicId" TEXT,
ADD COLUMN     "cloudinaryVideoPublicId" TEXT;
