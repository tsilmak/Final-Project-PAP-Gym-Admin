import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class SignaturesController {
  async getAllSignatures(req, res) {
    try {
      const signatures = await prisma.signature.findMany({
        include: {
          user: {
            select: {
              fname: true,
              lname: true,
              email: true,
              membershipNumber: true,
            },
          },
          gymPlan: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });

      res.status(200).json({ success: true, data: signatures });
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res
        .status(500)
        .json({ message: `Erro ao buscar os planos: ${error.message}` });
    }
  }

  async getSignatureById(req, res) {
    try {
      const signatureId = parseInt(req.params.id, 10);
      const signature = await prisma.signature.findUnique({
        where: { signatureId },
        include: {
          user: {
            select: {
              userId: true,
              fname: true,
              lname: true,
              email: true,
              membershipNumber: true,
              role: true,
              profilePictureUrl: true,
            },
          },
          gymPlan: {
            select: {
              name: true,
              price: true,
              features: true,
            },
          },
        },
      });

      if (!signature) {
        return res.status(404).json({ message: "Assinatura não encontrada" });
      }

      res.status(200).json({ success: true, data: signature });
    } catch (error) {
      console.error("Error fetching signature: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteSignatureById(req, res) {
    const signatureId = parseInt(req.params.id, 10);

    try {
      const signature = await prisma.signature.delete({
        where: { signatureId },
      });

      res.status(200).json({
        success: true,
        message: "Signature deleted successfully",
        data: signature,
      });
    } catch (error) {
      console.error("Error deleting signature", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async updateSignatureById(req, res) {
    try {
      const { id } = req.params;
      const signatureId = parseInt(id, 10);
      const { gymPlanId, startDate, endDate, isActive, userId } = req.body;

      const updateSignature = await prisma.signature.update({
        where: { signatureId },
        data: {
          gymPlanId,
          startDate,
          endDate,
          isActive,
          userId,
        },
      });

      res.status(200).json({ success: true, data: updateSignature });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}

export default new SignaturesController();
