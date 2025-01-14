import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_KEY);

class GymPlansController {
  async createGymPlan(req, res) {
    const { name, price, features, isActive, isHighlightedPlan } = req.body;
    if (!name || !price || !features) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos devem ser preenchidos",
      });
    }

    try {
      const newGymPlan = await stripe.products.create({
        name: name,
        shippable: false,
        description: JSON.stringify(features),
        active: isActive,
      });

      const priceInCents = price * 100;
      const newGymPlanPrice = await stripe.prices.create({
        currency: "EUR",
        unit_amount: priceInCents,
        recurring: {
          interval: "month",
        },
        product: newGymPlan.id,
      });
      await prisma.gymPlan.create({
        data: {
          name,
          price,
          features,
          isActive,
          isHighlightedPlan,
          productStripeId: newGymPlan.id,
          priceStripeId: newGymPlanPrice.id,
        },
      });

      console.log(price);
      console.log(newGymPlanPrice);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error creating gym plan:", error);
      res.status(500).json({
        success: false,
        message: `Erro ao criar o plano: ${error.message}`,
      });
    }
  }

  async getAllGymPlan(req, res) {
    try {
      const gymPlans = await prisma.gymPlan.findMany();
      const gymPlansStripe = await stripe.products.list();
      const plansWithClientCount = await Promise.all(
        gymPlans.map(async (gymPlan) => {
          const clientsCount = await prisma.signature.count({
            where: {
              gymPlanId: gymPlan.gymPlanId,
              isActive: true,
            },
          });

          return {
            ...gymPlan,
            clientsCount,
          };
        })
      );
      res.status(200).json({ success: true, data: plansWithClientCount });
    } catch (error) {
      console.error("Error fetching gym plans:", error);
      res.status(500).json({
        success: false,
        message: `Error fetching gym plans: ${error.message}`,
      });
    }
  }

  async updateGymPlan(req, res) {
    const { id } = req.params;
    try {
      const { name, features, price, isActive, isHighlightedPlan } = req.body;

      const parsedPrice = parseFloat(price);
      if (!name || !features || isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Todos os campos devem ser preenchidos e o preço deve ser válido.",
        });
      }

      const priceInCents = Math.round(parsedPrice * 100);

      const gymPlan = await prisma.gymPlan.findUnique({
        where: { gymPlanId: parseInt(id, 10) },
        select: { productStripeId: true, priceStripeId: true },
      });

      if (!gymPlan || !gymPlan.productStripeId) {
        console.log("Invalid gym plan or missing Stripe product ID:", gymPlan);
        return res.status(404).json({
          success: false,
          message: "Plano de ginásio inválido ou ID de produto Stripe ausente.",
        });
      }
      console.log("Stripe product ID:", gymPlan.productStripeId);

      const payload = {
        currency: "EUR",
        unit_amount: priceInCents,
        recurring: { interval: "month" },
        product: gymPlan.productStripeId,
      };
      console.log("Stripe price create payload:", payload);

      const newPriceStripe = await stripe.prices.create(payload);

      const updatedGymPlanStripe = await stripe.products.update(
        gymPlan.productStripeId,
        {
          name,
          description: JSON.stringify(features),
          active: isActive,
          default_price: newPriceStripe.id,
        }
      );

      await stripe.prices.update(gymPlan.priceStripeId, { active: false });

      await prisma.gymPlan.update({
        where: { gymPlanId: parseInt(id, 10) },
        data: {
          name,
          features,
          price: parsedPrice,
          isActive,
          isHighlightedPlan,
          productStripeId: updatedGymPlanStripe.id,
          priceStripeId: newPriceStripe.id,
        },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating gym plan:", error);
      res.status(500).json({
        success: false,
        message: `Erro ao modificar o plano: ${error.message}`,
      });
    }
  }

  async getGymPlanById(req, res) {
    try {
      const gymPlanId = parseInt(req.params.id, 10);
      const gymPlan = await prisma.gymPlan.findUnique({
        where: {
          gymPlanId,
        },
      });

      if (!gymPlan) {
        return res
          .status(404)
          .json({ success: false, message: "Plano não encontrado." });
      }

      res.json({ success: true, data: gymPlan });
    } catch (error) {
      console.error("Error fetching gym plan by ID:", error);
      res.status(500).json({
        success: false,
        message: `Erro ao pesquisar o plano: ${error.message}`,
      });
    }
  }

  async deleteGymPlan(req, res) {
    const { id } = req.params;
    console.log("PLANO ID ", id);

    const PLANOSTESTE = new Set([1, 2, 3, 4, 5]);
    const idInt = parseInt(id, 10);

    if (PLANOSTESTE.has(idInt)) {
      return res.status(400).json({
        success: false,
        message: "Este é um plano teste, crie outro para remove-lo",
      });
    }

    try {
      const clientsCount = await prisma.signature.count({
        where: {
          gymPlanId: idInt,
          isActive: true,
        },
      });

      if (clientsCount > 0) {
        return res.status(400).json({
          success: false,
          message: "Este plano tem membros associados. Não é possível remover",
        });
      }

      await prisma.signature.deleteMany({
        where: {
          gymPlanId: idInt,
        },
      });

      await prisma.gymPlan.delete({
        where: {
          gymPlanId: idInt,
        },
      });

      res.json({ success: true, message: "O Plano foi eliminado" });
    } catch (error) {
      console.error("Error deleting gym plan:", error);
      res.status(500).json({
        success: false,
        message: `Erro ao eliminar o plano: ${error.message}`,
      });
    }
  }

  async getAllUsersByGymPlanId(req, res) {
    try {
      const gymPlanId = parseInt(req.params.id, 10);

      const clients = await prisma.user.findMany({
        where: {
          signatures: {
            some: {
              gymPlanId,
              isActive: true,
            },
          },
        },
        select: {
          userId: true,
          fname: true,
          lname: true,
          email: true,
          profilePictureUrl: true,
        },
      });

      if (clients.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Não existe nenhum cliente associado ao este plano.",
        });
      }

      res.status(200).json({ success: true, data: clients });
    } catch (error) {
      console.error("Error fetching clients for gym plan:", error);
      res.status(500).json({
        success: false,
        message: `Error fetching clients: ${error.message}`,
      });
    }
  }
}

export default new GymPlansController();
