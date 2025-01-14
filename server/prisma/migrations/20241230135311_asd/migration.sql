/*
  Warnings:

  - Added the required column `exerciseName` to the `WorkoutPlanExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutPlanExercise" ADD COLUMN     "exerciseName" TEXT NOT NULL;
