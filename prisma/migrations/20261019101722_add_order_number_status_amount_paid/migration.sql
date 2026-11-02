/*
  Warnings:

  - A unique constraint covering the columns `[orderDate,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountPaid" INTEGER,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "orderDate" DATE NOT NULL,
ADD COLUMN     "orderNumber" INTEGER NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'COMPLETED';

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderDate_orderNumber_key" ON "Order"("orderDate", "orderNumber");
