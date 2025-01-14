-- CreateTable
CREATE TABLE "WorkoutCompletion" (
    "workoutCompletionId" TEXT NOT NULL,
    "userWhoCompleted" INTEGER NOT NULL,
    "workoutPlanSnapshot" JSONB NOT NULL,
    "summary" JSONB NOT NULL,

    CONSTRAINT "WorkoutCompletion_pkey" PRIMARY KEY ("workoutCompletionId")
);
