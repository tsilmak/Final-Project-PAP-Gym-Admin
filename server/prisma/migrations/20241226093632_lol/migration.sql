-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "workoutPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "madeByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exercises" JSONB[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("workoutPlanId")
);

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_madeByUserId_fkey" FOREIGN KEY ("madeByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
