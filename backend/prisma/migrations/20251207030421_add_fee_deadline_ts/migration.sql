/*
  Warnings:

  - A unique constraint covering the columns `[chainId,onChainDealId]` on the table `Deal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Deal_clientId_idx" ON "Deal"("clientId");

-- CreateIndex
CREATE INDEX "Deal_freelancerId_idx" ON "Deal"("freelancerId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_chainId_onChainDealId_key" ON "Deal"("chainId", "onChainDealId");

-- CreateIndex
CREATE INDEX "User_address_idx" ON "User"("address");
