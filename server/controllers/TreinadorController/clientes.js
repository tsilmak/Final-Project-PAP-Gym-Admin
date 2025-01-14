import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class TreinadorController {
  async getAllUsersForTreinador(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          userId: true,
          profilePictureUrl: true,
          membershipNumber: true,
          fname: true,
          lname: true,
          email: true,
          phoneNumber: true,
          birthDate: true,
          createdAt: true,
          signatures: {
            select: {
              gymPlan: {
                select: {
                  name: true,
                },
              },
              isActive: true,
            },
          },
          role: {
            select: {
              rolesId: true,
              rolesName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async getUserForTreinador(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await prisma.user.findUnique({
        where: { userId: userId },
        include: {
          signatures: {
            select: {
              signatureId: true,
              startDate: true,
              endDate: true,
              isActive: true,
              gymPlan: {
                select: {
                  gymPlanId: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          role: {
            select: {
              rolesName: true,
            },
          },
          bodyMetrics: {
            select: {
              bodyMetricsId: true,
              weight: true,
              height: true,
              fatPercentage: true,
              muscleMass: true,
              waist: true,
              chest: true,
              hip: true,
              thigh: true,
              biceps: true,
              restingHeartRate: true,
              appointmentDate: true,
              appointmentMadeBy: {
                select: {
                  userId: true,
                  fname: true,
                  lname: true,
                },
              },
            },
            orderBy: {
              appointmentDate: "desc",
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const responseUser = {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        birthDate: user.birthDate,
        profilePictureUrl: user.profilePictureUrl,
        gender: user.gender,
        membershipNumber: user.membershipNumber,
        createdAt: user.createdAt,
        signatures: user.signatures,
        role: user.role,
        bodyMetrics: user.bodyMetrics,
      };

      res.json(responseUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateUserMetrics(req, res) {
    try {
      const appointmentMadeById = req.userId;
      const userId = parseInt(req.params.id);
      const {
        weight,
        height,
        fatPercentage,
        muscleMass,
        waist,
        chest,
        hip,
        thigh,
        biceps,
        restingHeartRate,
      } = req.body;

      const user = await prisma.user.findUnique({
        where: { userId: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Data to be inserted:", {
        userId,
        appointmentMadeById,
        appointmentDate: new Date().toISOString(),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fatPercentage: fatPercentage ? parseFloat(fatPercentage) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        waist: waist ? parseFloat(waist) : null,
        chest: chest ? parseFloat(chest) : null,
        hip: hip ? parseFloat(hip) : null,
        thigh: thigh ? parseFloat(thigh) : null,
        biceps: biceps ? parseFloat(biceps) : null,
        restingHeartRate: restingHeartRate
          ? parseFloat(restingHeartRate)
          : null,
      });
      const newMetrics = await prisma.bodyMetrics.create({
        data: {
          userId,
          appointmentMadeById,
          appointmentDate: new Date().toISOString(),
          weight: parseFloat(weight),
          height: parseFloat(height),
          fatPercentage: fatPercentage ? parseFloat(fatPercentage) : null,
          muscleMass: muscleMass ? parseFloat(muscleMass) : null,
          waist: waist ? parseFloat(waist) : null,
          chest: chest ? parseFloat(chest) : null,
          hip: hip ? parseFloat(hip) : null,
          thigh: thigh ? parseFloat(thigh) : null,
          biceps: biceps ? parseFloat(biceps) : null,
          restingHeartRate: restingHeartRate
            ? parseFloat(restingHeartRate)
            : null,
        },
      });

      res.json(newMetrics);
    } catch (error) {
      console.error("Error updating user metrics:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  async getUserMetricsHistory(req, res) {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      const metricsHistory = await prisma.bodyMetrics.findMany({
        where: { userId: userId },
        include: {
          appointmentMadeBy: {
            select: {
              fname: true,
              lname: true,
            },
          },
        },
      });
      if (!metricsHistory) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(metricsHistory);
    } catch (error) {
      console.error("Error updating user metrics:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}
export default new TreinadorController();
