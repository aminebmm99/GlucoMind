-- CreateTable
CREATE TABLE "GlucoseReading" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "glucoseValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'mg/dL',
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "context" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlucoseReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlucoseReading_userId_idx" ON "GlucoseReading"("userId");

-- CreateIndex
CREATE INDEX "GlucoseReading_userId_measuredAt_idx" ON "GlucoseReading"("userId", "measuredAt");

-- AddForeignKey
ALTER TABLE "GlucoseReading" ADD CONSTRAINT "GlucoseReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
