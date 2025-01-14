import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ClassController {
  async createClassType(req, res) {
    const { name, color } = req.body;

    try {
      const existingName = await prisma.classType.findUnique({
        where: { name },
      });

      if (existingName) {
        return res.status(400).json({
          error:
            "O nome do tipo de aula já está em uso. Por favor, escolha outro.",
        });
      }

      const existingColor = await prisma.classType.findUnique({
        where: { color },
      });

      if (existingColor) {
        return res.status(400).json({
          error:
            "A cor do tipo de aula já está em uso. Por favor, escolha outra.",
        });
      }

      await prisma.classType.create({
        data: {
          name,
          color,
        },
      });

      res.status(201).json("success");
    } catch (error) {
      if (error.code === "P2002") {
        const field = error.meta.target;
        return res.status(400).json({
          error: `O campo ${field} já está em uso. Por favor, escolha outro.`,
        });
      }

      res.status(500).json({
        error:
          "Ocorreu um erro desconhecido ao tentar criar o tipo de aula, por favor, tente novamente",
        details: error.message,
      });
      console.log(error);
    }
  }
  async readClassType(req, res) {
    try {
      const allClassType = await prisma.classType.findMany({
        orderBy: {
          classTypeId: "asc",
        },
        include: {
          Class: {
            select: {
              classId: true,
            },
          },
        },
      });

      const classTypeWithAssociation = allClassType.map((classType) => ({
        ...classType,
        hasAssociatedClasses: classType.Class.length > 0,
      }));

      res.status(200).json(classTypeWithAssociation);
    } catch (error) {
      res.status(500).json({
        error:
          "Ocorreu um erro desconhecido ao tentar ver todos os tipos de aula, por favor, tente novamente",
        details: error.message,
      });
    }
  }
  async updateClassType(req, res) {
    const { classTypeId, name, color } = req.body;

    if (!classTypeId || !name || !color) {
      return res
        .status(400)
        .json({ message: "classTypeId, name, and color are required." });
    }

    try {
      const existingName = await prisma.classType.findUnique({
        where: { name },
      });

      const existingColor = await prisma.classType.findUnique({
        where: { color },
      });

      if (existingName && existingName.classTypeId !== classTypeId) {
        return res.status(400).json({ error: "Name is already in use." });
      }

      if (existingColor && existingColor.classTypeId !== classTypeId) {
        return res.status(400).json({ error: "Color is already in use." });
      }

      await prisma.classType.update({
        where: { classTypeId },
        data: {
          name,
          color,
        },
      });

      res.status(200).json("success");
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: `Ocorreu um erro: ${err.message || "Unknown error"}`,
      });
    }
  }

  async deleteClassType(req, res) {
    const { classTypeId } = req.params;

    if (!classTypeId) {
      return res.status(400).json({ message: "classTypeId is required." });
    }

    try {
      const classTypeIdInt = parseInt(classTypeId, 10);

      if (isNaN(classTypeIdInt)) {
        return res
          .status(400)
          .json({ message: "classTypeId must be a valid number." });
      }

      const classTypeExists = await prisma.classType.findUnique({
        where: { classTypeId: classTypeIdInt },
      });

      if (!classTypeExists) {
        return res.status(404).json({ message: "Class type not found." });
      }

      const associatedClasses = await prisma.class.count({
        where: { classTypeId: classTypeIdInt },
      });

      if (associatedClasses > 0) {
        return res.status(400).json({
          message:
            "Class type is associated with existing classes and cannot be deleted.",
        });
      }

      await prisma.classType.delete({
        where: { classTypeId: classTypeIdInt },
      });

      res.status(200).json({ message: "Class type deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: `An error occurred: ${err.message || "Unknown error"}`,
      });
    }
  }

  async createClass(req, res) {
    try {
      const {
        location,
        maxParticipants,
        startTime,
        endTime,
        classDate,
        isOnline,
        onlineClassUrl,
        classType,
        isExclusive,
        instructors,
        exclusiveGymPlan,
        isFullDay,
      } = req.body.data;

      if (!startTime || !endTime || !classType) {
        return res.status(400).json({
          error: "startTime, endTime, and classTypeId are required fields.",
        });
      }

      if (isExclusive && (!exclusiveGymPlan || exclusiveGymPlan.length === 0)) {
        return res.status(400).json({
          error:
            "You must specify at least one exclusive gym plan for an exclusive class.",
        });
      }

      const parsedMaxParticipants = parseInt(maxParticipants, 10);
      if (isNaN(parsedMaxParticipants)) {
        return res.status(400).json({
          error: "maxParticipants must be a valid integer.",
        });
      }

      const newClass = await prisma.class.create({
        data: {
          location,
          maxParticipants: parsedMaxParticipants,
          startTime,
          endTime,
          classDate: new Date(classDate),
          isOnline,
          onlineClassUrl: isOnline ? onlineClassUrl : null,
          isExclusive,
          isFullDay,
          classType: { connect: { classTypeId: classType } },
        },
      });

      if (instructors && instructors.length > 0) {
        await prisma.instructorToClass.createMany({
          data: instructors.map((instructorId) => ({
            userId: instructorId,
            classId: newClass.classId,
          })),
        });
      }

      if (isExclusive && exclusiveGymPlan && exclusiveGymPlan.length > 0) {
        await prisma.gymPlanExclusivityToClass.createMany({
          data: exclusiveGymPlan.map((planId) => ({
            gymPlanId: planId,
            classId: newClass.classId,
          })),
        });
      }

      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({
        error: "An error occurred while creating the class.",
      });
    }
  }
  async getClasses(req, res) {
    try {
      const classes = await prisma.class.findMany({
        include: {
          InstructorToClass: {
            select: {
              userId: true,
            },
          },
          GymPlanExclusivityToClass: {
            select: {
              gymPlanId: true,
            },
          },
          classType: {
            select: {
              classTypeId: true,
              color: true,
              name: true,
            },
          },
        },
      });

      const formattedClasses = classes.map((classItem) => {
        const startDate = classItem.classDate.toISOString().split("T")[0];
        const startTime = classItem.startTime;
        const endTime = classItem.endTime;

        const formattedStart = `${startDate}T${startTime}`;
        let formattedEnd = `${startDate}T${endTime}`;

        return {
          id: classItem.classId,
          title: classItem.classType.name,
          start: formattedStart,
          end: formattedEnd,
          location: classItem.location,
          isExclusive: classItem.isExclusive,
          isOnline: classItem.isOnline,
          backgroundColor: classItem.classType.color,
          extendedProps: {
            maxParticipants: Number(classItem.maxParticipants),
            instructors: classItem.InstructorToClass.map(
              (instructor) => instructor.userId
            ),
            exclusiveGymPlans: classItem.GymPlanExclusivityToClass.map(
              (plan) => plan.gymPlanId
            ),
            classType: classItem.classType.classTypeId,
            isFullDay: classItem.isFullDay,
          },
          allDay: classItem.isFullDay,
        };
      });

      res.status(200).json(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({
        error: "An error occurred while fetching classes.",
      });
    }
  }
  async editClass(req, res) {
    try {
      const { classId } = req.body;
      const {
        location,
        maxParticipants,
        startTime,
        endTime,
        classDate,
        isOnline,
        onlineClassUrl,
        classType,
        isExclusive,
        instructors,
        exclusiveGymPlan,
        isFullDay,
      } = req.body.data;

      console.log(req.body.data);
      console.log("Request Data:", req.body);

      if (!classId) {
        return res.status(400).json({
          error: "classId is required to update the class.",
        });
      }

      const parsedClassId = parseInt(classId, 10);
      if (isNaN(parsedClassId)) {
        return res.status(400).json({
          error: "classId must be a valid integer.",
        });
      }

      const existingClass = await prisma.class.findUnique({
        where: { classId: parsedClassId },
      });

      if (!existingClass) {
        return res.status(404).json({
          error: "Class not found.",
        });
      }

      if (!startTime || !endTime || !classType) {
        return res.status(400).json({
          error: "startTime, endTime, and classTypeId are required fields.",
        });
      }

      if (isExclusive && (!exclusiveGymPlan || exclusiveGymPlan.length === 0)) {
        return res.status(400).json({
          error:
            "You must specify at least one exclusive gym plan for an exclusive class.",
        });
      }

      const parsedMaxParticipants = parseInt(maxParticipants, 10);
      if (isNaN(parsedMaxParticipants) || parsedMaxParticipants <= 0) {
        return res.status(400).json({
          error: "maxParticipants must be a valid positive integer.",
        });
      }

      const updatedClass = await prisma.class.update({
        where: { classId: parsedClassId },
        data: {
          location: location || existingClass.location,
          maxParticipants: parsedMaxParticipants,
          startTime: startTime || existingClass.startTime,
          endTime: endTime || existingClass.endTime,
          classDate: classDate ? new Date(classDate) : existingClass.classDate,
          isOnline,
          onlineClassUrl: isOnline
            ? onlineClassUrl
            : existingClass.onlineClassUrl,
          isExclusive,
          isFullDay,
          classType: classType
            ? { connect: { classTypeId: classType } }
            : existingClass.classTypeId,
        },
      });

      if (instructors && instructors.length > 0) {
        await prisma.instructorToClass.deleteMany({
          where: { classId: parsedClassId },
        });
        await prisma.instructorToClass.createMany({
          data: instructors.map((instructorId) => ({
            userId: instructorId,
            classId: updatedClass.classId,
          })),
        });
      }

      if (isExclusive && exclusiveGymPlan && exclusiveGymPlan.length > 0) {
        await prisma.gymPlanExclusivityToClass.deleteMany({
          where: { classId: parsedClassId },
        });
        await prisma.gymPlanExclusivityToClass.createMany({
          data: exclusiveGymPlan.map((planId) => ({
            gymPlanId: planId,
            classId: updatedClass.classId,
          })),
        });
      }

      res.status(200).json(updatedClass);
    } catch (error) {
      console.error("Error editing class:", error);
      res.status(500).json({
        error: "An error occurred while updating the class.",
      });
    }
  }

  async deleteClass(req, res) {
    try {
      const { classId } = req.body;
      console.log(req.body);
      if (!classId) {
        return res.status(400).json({
          error: "classId is required to delete the class.",
        });
      }

      const parsedClassId = parseInt(classId, 10);
      if (isNaN(parsedClassId)) {
        return res.status(400).json({
          error: "classId must be a valid integer.",
        });
      }

      const existingClass = await prisma.class.findUnique({
        where: { classId: parsedClassId },
      });

      if (!existingClass) {
        return res.status(404).json({
          error: "Class not found.",
        });
      }

      await prisma.instructorToClass.deleteMany({
        where: { classId: parsedClassId },
      });

      await prisma.gymPlanExclusivityToClass.deleteMany({
        where: { classId: parsedClassId },
      });

      await prisma.class.delete({
        where: { classId: parsedClassId },
      });

      res.status(200).json({
        message: "Class deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({
        error: "An error occurred while deleting the class.",
      });
    }
  }
}

export default new ClassController();
