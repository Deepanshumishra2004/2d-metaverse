/*
  Warnings:

  - You are about to drop the column `height` on the `MapElements` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `MapElements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MapElements" DROP COLUMN "height",
DROP COLUMN "width";
