CREATE UNIQUE INDEX "Plot_userId_default_unique"
ON "Plot"("userId")
WHERE "isDefault" = true;
