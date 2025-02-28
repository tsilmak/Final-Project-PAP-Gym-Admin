-- CreateEnum
CREATE TYPE "MachineTypes" AS ENUM ('Cardio', 'Musculacao', 'Funcional');

-- CreateEnum
CREATE TYPE "ExerciseTypes" AS ENUM ('Forca', 'Cardio', 'Funcional');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('Iniciante', 'Intermediario', 'Avancado');

-- CreateTable
CREATE TABLE "Roles" (
    "rolesId" SERIAL NOT NULL,
    "rolesName" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("rolesId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "docType" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "address2" TEXT,
    "zipcode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "picturePublicId" TEXT,
    "profilePictureUrl" TEXT DEFAULT 'https://res.cloudinary.com/dmfbmt6mi/image/upload/v1728065225/fxprtk8maztocrsmfswh.jpg',
    "customerStripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationsIds" INTEGER[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userWhoCreatedConversation" INTEGER NOT NULL,
    "participantIds" INTEGER[],
    "messageIds" INTEGER[],

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "cloudinaryImagePublicId" TEXT,
    "cloudinaryVideoPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "signatureId" SERIAL NOT NULL,
    "gymPlanId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("signatureId")
);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "paymentStatusId" SERIAL NOT NULL,
    "paymentStatusName" TEXT NOT NULL,

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("paymentStatusId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "signatureId" INTEGER NOT NULL,
    "paymentStatusId" INTEGER NOT NULL DEFAULT 1,
    "paymentStripeId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "GymPlan" (
    "gymPlanId" SERIAL NOT NULL,
    "features" JSONB NOT NULL,
    "price" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isHighlightedPlan" BOOLEAN NOT NULL DEFAULT false,
    "productStripeId" TEXT,
    "priceStripeId" TEXT,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "GymPlan_pkey" PRIMARY KEY ("gymPlanId")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "categoryId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "Blog" (
    "blogId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "coverImagePublicId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("blogId")
);

-- CreateTable
CREATE TABLE "BlogAuthor" (
    "blogId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BlogAuthor_pkey" PRIMARY KEY ("blogId","userId")
);

-- CreateTable
CREATE TABLE "BlogCategoryOnBlog" (
    "blogId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "BlogCategoryOnBlog_pkey" PRIMARY KEY ("blogId","categoryId")
);

-- CreateTable
CREATE TABLE "Class" (
    "classId" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classDate" TIMESTAMP(3) NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "onlineClassUrl" TEXT,
    "isExclusive" BOOLEAN NOT NULL,
    "classTypeId" INTEGER NOT NULL,
    "isFullDay" BOOLEAN NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "ClassType" (
    "classTypeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "ClassType_pkey" PRIMARY KEY ("classTypeId")
);

-- CreateTable
CREATE TABLE "InstructorToClass" (
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "InstructorToClass_pkey" PRIMARY KEY ("userId","classId")
);

-- CreateTable
CREATE TABLE "GymPlanExclusivityToClass" (
    "gymPlanId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "GymPlanExclusivityToClass_pkey" PRIMARY KEY ("gymPlanId","classId")
);

-- CreateTable
CREATE TABLE "Machine" (
    "MachineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MachineTypes" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("MachineId")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "exerciseId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exerciseType" "ExerciseTypes" NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "targetMuscle" TEXT NOT NULL,
    "secondaryMuscle" TEXT,
    "commentsAndTips" TEXT[],
    "execution" TEXT[],
    "videoUrl" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("exerciseId")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "workoutPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "madeByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("workoutPlanId")
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutCompletion" (
    "workoutCompletionId" TEXT NOT NULL,
    "userWhoCompleted" INTEGER NOT NULL,
    "workoutPlanSnapshot" JSONB NOT NULL,
    "summary" JSONB NOT NULL,

    CONSTRAINT "WorkoutCompletion_pkey" PRIMARY KEY ("workoutCompletionId")
);

-- CreateTable
CREATE TABLE "BodyMetrics" (
    "bodyMetricsId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "appointmentMadeById" INTEGER NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "waist" DOUBLE PRECISION,
    "hip" DOUBLE PRECISION,
    "thigh" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "biceps" DOUBLE PRECISION,
    "restingHeartRate" DOUBLE PRECISION,
    "fatPercentage" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,

    CONSTRAINT "BodyMetrics_pkey" PRIMARY KEY ("bodyMetricsId")
);

-- CreateTable
CREATE TABLE "_GymPlanClass" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserClass" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_rolesName_key" ON "Roles"("rolesName");

-- CreateIndex
CREATE UNIQUE INDEX "User_membershipNumber_key" ON "User"("membershipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nif_key" ON "User"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "User_customerStripeId_key" ON "User"("customerStripeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStatus_paymentStatusName_key" ON "PaymentStatus"("paymentStatusName");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentStripeId_key" ON "Payment"("paymentStripeId");

-- CreateIndex
CREATE UNIQUE INDEX "GymPlan_productStripeId_key" ON "GymPlan"("productStripeId");

-- CreateIndex
CREATE UNIQUE INDEX "GymPlan_priceStripeId_key" ON "GymPlan"("priceStripeId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClassType_name_key" ON "ClassType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClassType_color_key" ON "ClassType"("color");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_name_key" ON "Machine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_GymPlanClass_AB_unique" ON "_GymPlanClass"("A", "B");

-- CreateIndex
CREATE INDEX "_GymPlanClass_B_index" ON "_GymPlanClass"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserClass_AB_unique" ON "_UserClass"("A", "B");

-- CreateIndex
CREATE INDEX "_UserClass_B_index" ON "_UserClass"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("rolesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_gymPlanId_fkey" FOREIGN KEY ("gymPlanId") REFERENCES "GymPlan"("gymPlanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentStatusId_fkey" FOREIGN KEY ("paymentStatusId") REFERENCES "PaymentStatus"("paymentStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature"("signatureId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogAuthor" ADD CONSTRAINT "BlogAuthor_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("blogId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogAuthor" ADD CONSTRAINT "BlogAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogCategoryOnBlog" ADD CONSTRAINT "BlogCategoryOnBlog_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("blogId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogCategoryOnBlog" ADD CONSTRAINT "BlogCategoryOnBlog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("categoryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("classTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorToClass" ADD CONSTRAINT "InstructorToClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorToClass" ADD CONSTRAINT "InstructorToClass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPlanExclusivityToClass" ADD CONSTRAINT "GymPlanExclusivityToClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPlanExclusivityToClass" ADD CONSTRAINT "GymPlanExclusivityToClass_gymPlanId_fkey" FOREIGN KEY ("gymPlanId") REFERENCES "GymPlan"("gymPlanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Machine"("MachineId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_madeByUserId_fkey" FOREIGN KEY ("madeByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("workoutPlanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("exerciseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMetrics" ADD CONSTRAINT "BodyMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMetrics" ADD CONSTRAINT "BodyMetrics_appointmentMadeById_fkey" FOREIGN KEY ("appointmentMadeById") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymPlanClass" ADD CONSTRAINT "_GymPlanClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("classId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymPlanClass" ADD CONSTRAINT "_GymPlanClass_B_fkey" FOREIGN KEY ("B") REFERENCES "GymPlan"("gymPlanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserClass" ADD CONSTRAINT "_UserClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("classId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserClass" ADD CONSTRAINT "_UserClass_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
