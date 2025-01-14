import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class PaymentsController {
  async getAllPayments(req, res) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          paymentStatus: {
            select: {
              paymentStatusName: true,
            },
          },
          signature: {
            select: {
              user: {
                select: {
                  fname: true,
                  lname: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(payments);
    } catch (error) {
      console.error("Erro desconhecido:", error);
      res.status(500).json({ message: "Erro desconhecido", error });
    }
  }
  async getPaymentsBySignatureId(req, res) {
    try {
      const { signatureId } = req.params;
      if (!signatureId) {
        return res.status(400).json({ message: "Signature ID is required" });
      }

      const signature = await prisma.signature.findUnique({
        where: { signatureId: Number(signatureId) },
        select: { userId: true },
      });

      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }

      const { userId } = signature;

      const payments = await prisma.payment.findMany({
        where: { signatureId: Number(signatureId) },
        include: {
          paymentStatus: {
            select: {
              paymentStatusName: true,
            },
          },
        },
      });

      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getPaymentById(req, res) {
    try {
      const paymentId = Number(req.params.id);
      const payment = await prisma.payment.findUnique({
        where: { paymentId },
        include: {
          paymentStatus: {
            select: {
              paymentStatusName: true,
            },
          },
          signature: {
            select: {
              signatureId: true,
              user: {
                select: {
                  fname: true,
                  lname: true,
                  email: true,
                  membershipNumber: true,
                  profilePictureUrl: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return res.status(404).json({
          message: "Nenhum pagamento foi encontrado com esse identificador",
        });
      }

      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  async createPayment(req, res) {
    try {
      console.log(req.body);

      const { signatureId, date, amount, paymentStatusId, title } = req.body;

      if (amount < 0) {
        return res
          .status(400)
          .json({ message: "Payment amount must be positive." });
      }

      if (!signatureId) {
        return res
          .status(400)
          .json({ message: "A valid signatureId is required." });
      }
      if (!title) {
        return res.status(400).json({ message: "title is required." });
      }

      const existingSignature = await prisma.signature.findUnique({
        where: { signatureId: Number(signatureId) },
      });
      if (!existingSignature) {
        return res.status(400).json({ message: "Signature not found." });
      }

      const newPayment = await prisma.payment.create({
        data: {
          title,
          date,
          amount,
          signature: { connect: { signatureId: Number(signatureId) } },
          paymentStatus: {
            connect: { paymentStatusId: Number(paymentStatusId) },
          },
        },
      });

      return res.status(201).json({
        message: "Payment created successfully.",
        payment: newPayment,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      return res
        .status(500)
        .json({ message: `Error creating payment: ${error.message}` });
    }
  }

  async updatePayment(req, res) {
    try {
      const paymentId = Number(req.params.id);
      const { amount, date, status, signatureId, title } = req.body;
      console.log("REQ BODY PAYMENT ID ", req.body);

      if (!paymentId || !amount || !date || !status || !signatureId || !title) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const updatedPayment = await prisma.payment.update({
        where: { paymentId },
        data: {
          title: title,
          amount: parseFloat(amount),
          date: new Date(date),
          signatureId: Number(signatureId),
          paymentStatusId: status,
        },
      });
      console.log(updatedPayment);

      return res.status(200).json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deletePayment(req, res) {
    try {
      const paymentId = Number(req.params.id);
      await prisma.payment.delete({
        where: { paymentId },
      });
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteAllPaymentsRelatedToSignatureQuery(req, res) {
    try {
      const { signatureId } = req.body;

      if (!signatureId) {
        return res.status(400).json({ message: "Signature ID is required" });
      }

      await prisma.payment.deleteMany({
        where: { signatureId: Number(signatureId) },
      });

      res.json({
        message: "All payments related to the signature have been deleted",
      });
    } catch (error) {
      console.error("Error deleting payments:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getStatus(req, res) {
    try {
      const paymentStatuses = await prisma.paymentStatus.findMany();
      res.status(200).json(paymentStatuses);
    } catch (error) {
      console.error("Error fetching Payment Status:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new PaymentsController();
