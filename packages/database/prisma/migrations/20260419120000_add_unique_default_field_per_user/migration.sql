CREATE UNIQUE INDEX "Field_userId_default_unique"
ON "Field"("userId")
WHERE "isDefault" = true;
