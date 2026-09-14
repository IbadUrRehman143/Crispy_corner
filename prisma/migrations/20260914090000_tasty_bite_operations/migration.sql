ALTER TABLE "Order" ADD COLUMN "customerNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryFee" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "estimatedMinutes" INTEGER NOT NULL DEFAULT 30;
CREATE TABLE "StoreSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "storeName" TEXT NOT NULL DEFAULT 'Tasty Bite',
  "isOpen" BOOLEAN NOT NULL DEFAULT true,
  "openingTime" TEXT NOT NULL DEFAULT '11:00',
  "closingTime" TEXT NOT NULL DEFAULT '23:00',
  "deliveryFee" INTEGER NOT NULL DEFAULT 0,
  "minimumDelivery" INTEGER NOT NULL DEFAULT 0,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
  "deliveryAreas" TEXT NOT NULL DEFAULT 'Tordher',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);
