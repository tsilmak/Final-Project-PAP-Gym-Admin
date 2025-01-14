import {
  generatePassword,
  sendPasswordByEmail,
} from "../utils/generateAndSendPassword.js";
import { deleteFromCloudinary } from "../utils/Cloudinary.js";
import { authentication, random } from "../helper/authentication.js";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_KEY);

async function generateMemberShipNumber(prisma) {
  const yearPrefix = new Date().getFullYear().toString().slice(-2);
  let uniqueNumber;

  do {
    uniqueNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
  } while (
    await prisma.user.findUnique({
      where: {
        membershipNumber: `${yearPrefix}${uniqueNumber}`,
      },
    })
  );

  return `${yearPrefix}${uniqueNumber}`;
}
const fetchCountryTlds = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=tld"
    );
    const data = await response.json();

    return data.map((country) => country.tld[0]?.replace(".", "") || "");
  } catch (error) {
    console.error("Error fetching country TLDs:", error);
    throw new Error("Unable to fetch country TLDs");
  }
};
const fetchCityData = async (countryTld, zipcode) => {
  try {
    // Fetch city data using TLD
    const response = await fetch(
      `https://api.zippopotam.us/${countryTld}/${zipcode}`
    );
    if (response.ok) {
      const data = await response.json();
      return { city: data.places[0]["place name"], error: null };
    } else {
      return { city: null, error: "Invalid postal code" };
    }
  } catch (error) {
    console.error("Error fetching city data:", error);
    return { city: null, error: "Error checking the postal code" };
  }
};
class UserController {
  async getAllEmployees(req, res) {
    try {
      const employees = await prisma.user.findMany({
        where: {
          role: {
            rolesId: {
              not: 1,
            },
          },
        },
        select: {
          userId: true,
          fname: true,
          lname: true,
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
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async createUser(req, res) {
    try {
      const {
        fname,
        lname,
        email,
        phoneNumber,
        gender,
        birthDate,
        docType,
        docNumber,
        nif,
        address,
        address2,
        zipcode,
        country,
        city,
        gymPlanId,
        signatureStartDate,
        signatureEndDate,
        registrationFee,
        role,
      } = req.body;
      console.log(req.body);
      const validCountryTlds = await fetchCountryTlds();

      const userSchema = Joi.object({
        fname: Joi.string()
          .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
          .max(30)
          .required(),
        lname: Joi.string()
          .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
          .max(30)
          .required(),
        email: Joi.string().email().max(100).required(),
        phoneNumber: Joi.string().required(),
        gender: Joi.string()
          .valid("Feminino", "Masculino", "NaoDivulgar")
          .required(),

        birthDate: Joi.date()
          .less("now")
          .max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)))
          .required()
          .messages({
            "date.less": "A data de nascimento não pode ser no futuro.",
            "date.max": "É necessário ter pelo menos 16 anos.",
            "any.required": "Insira a sua data de nascimento.",
          }),
        docType: Joi.string().valid("cc", "bi", "cn", "p").required().messages({
          "any.required": "Indica o tipo de documento",
          "any.only": "Tipo de documento inválido. Selecione uma opção válida.",
        }),
        docNumber: Joi.string().min(5).max(25).required(),
        nif: Joi.string().min(5).max(22).required(),
        address: Joi.string().min(5).max(255).required(),
        address2: Joi.string().min(5).max(255).allow(""),
        country: Joi.string()
          .valid(...validCountryTlds)
          .required()
          .messages({
            "any.required": "País é obrigatório.",
            "any.only": "O país selecionado não é válido.",
          }),
        zipcode: Joi.string().required(),
        city: Joi.string().required(),
        role: Joi.number().required(),

        registrationFee: Joi.when("role", {
          is: 1,
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
        signatureStartDate: Joi.when("role", {
          is: 1,
          then: Joi.date().required(),
          otherwise: Joi.forbidden(),
        }),
        signatureEndDate: Joi.when("role", {
          is: 1,
          then: Joi.date().optional(),
          otherwise: Joi.forbidden(),
        }),
        gymPlanId: Joi.when("role", {
          is: 1,
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
      });

      var validation = userSchema.validate(req.body);
      var error = validation.error;
      var value = validation.value;

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedNif = /^[A-Za-z]{2}/.test(nif) ? nif : `PT${nif}`;

      const existingUserByNif = await prisma.user.findUnique({
        where: { nif: updatedNif },
      });

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUserByNif) {
        return res.status(400).json({
          message: `O NIF "${updatedNif}" já está registado no banco de dados.`,
        });
      }

      if (existingUserByEmail) {
        return res.status(400).json({
          message: `O email "${email}" já está registado no banco de dados.`,
        });
      }

      const membershipNumber = await generateMemberShipNumber(prisma);
      const password = generatePassword();

      const salt = random();
      const hashedPassword = authentication(salt, password);

      await prisma.$transaction(async (prisma) => {
        const stripeCustomer = await stripe.customers.create({
          name: `${fname} ${lname}`,
          email: email,
          phone: phoneNumber,
          address: {
            line1: address,
            line2: address2 || "",
            city: city,
            postal_code: zipcode,
            country: country,
          },
        });
        console.log("Stripe customer created:", stripeCustomer.id);
        const newUser = await prisma.user.create({
          data: {
            membershipNumber,
            hashedPassword,
            salt,
            fname,
            lname,
            email,
            phoneNumber,
            gender,
            birthDate,
            docType,
            docNumber,
            nif: updatedNif,
            address,
            address2,
            zipcode,
            country,
            city,
            customerStripeId: stripeCustomer.id,
            role: {
              connect: { rolesId: role },
            },
          },
        });

        let newSignature;

        if (role !== 1) {
          const gymPlanId = 1;

          newSignature = await prisma.signature.create({
            data: {
              gymPlanId,
              startDate: new Date(),
              endDate: null,
              userId: newUser.userId,
            },
          });
        } else {
          const newSignatureData = {
            gymPlanId,
            startDate: new Date(signatureStartDate),
            userId: newUser.userId,
          };

          if (signatureEndDate) {
            newSignatureData.endDate = new Date(signatureEndDate);
          }

          newSignature = await prisma.signature.create({
            data: newSignatureData,
          });
          const gymPlan = await prisma.gymPlan.findUnique({
            where: { gymPlanId: gymPlanId },
            select: {
              name: true,
            },
          });
          await prisma.payment.create({
            data: {
              title: `Registo para o plano ${gymPlan.name}`,
              date: new Date(),
              amount: Number(registrationFee),
              signature: {
                connect: { signatureId: newSignature.signatureId },
              },
            },
          });
        }

        await sendPasswordByEmail(email, password);
      });

      res.status(201).json({ message: "Utilizador criado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getAllUsers(req, res) {
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

  async getUserById(req, res) {
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
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateUser(req, res) {
    try {
      const {
        userId,
        fname,
        lname,
        email,
        phoneNumber,
        gender,
        birthDate,
        docType,
        docNumber,
        nif,
        address,
        address2,
        zipcode,
        country,
        city,
        gymPlanId,
        signatureStartDate,
        signatureEndDate,
        registrationFee,
        role,
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
      }

      if (userId === 1 || userId === 2) {
        return res
          .status(403)
          .json({ message: "Administrador teste impossível de editar" });
      }

      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "O utilizador não foi encontrador" });
      }

      const updatedNif = /^[A-Za-z]{2}/.test(nif) ? nif : `PT${nif}`;

      if (email && email !== user.email) {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUserByEmail) {
          return res
            .status(400)
            .json({ message: `The email "${email}" is already in use.` });
        }
      }

      if (nif && updatedNif !== user.nif) {
        const existingUserByNif = await prisma.user.findUnique({
          where: { nif: updatedNif },
        });
        if (existingUserByNif) {
          return res
            .status(400)
            .json({ message: `The NIF "${updatedNif}" is already in use.` });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { userId },
        data: {
          fname,
          lname,
          email,
          phoneNumber,
          gender,
          birthDate: new Date(birthDate),
          docType,
          docNumber,
          nif: updatedNif,
          address,
          address2,
          zipcode,
          country,
          city,
          role: role ? { connect: { rolesId: role } } : undefined, // Connect role if updated
        },
      });

      if (signatureStartDate || signatureEndDate || gymPlanId) {
        await prisma.signature.updateMany({
          where: { userId: updatedUser.userId },
          data: {
            gymPlanId: gymPlanId ? gymPlanId : undefined,
            startDate: signatureStartDate
              ? new Date(signatureStartDate)
              : undefined,
            endDate: signatureEndDate ? new Date(signatureEndDate) : undefined,
          },
        });
      }

      if (registrationFee) {
        await prisma.payment.create({
          data: {
            date: new Date(),
            amount: Number(registrationFee),
            user: {
              connect: { userId: updatedUser.userId },
            },
          },
        });
      }

      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (userId === 1 || userId === 2) {
        return res
          .status(501)
          .json({ message: "Cannot delete test administrators" });
      }

      const user = await prisma.user.findUnique({ where: { userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.blogAuthor.deleteMany({ where: { userId } });

        await prisma.instructorToClass.deleteMany({ where: { userId } });

        const messages = await prisma.message.deleteMany({
          where: { senderId: userId },
        });

        const conversations = await prisma.conversation.findMany({
          where: { participantIds: { has: userId } },
        });

        for (const conversation of conversations) {
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              participantIds: conversation.participantIds.filter(
                (id) => id !== userId
              ),
            },
          });
        }

        await prisma.payment.deleteMany({
          where: { signature: { userId } },
        });
        await prisma.signature.deleteMany({ where: { userId } });

        await prisma.bodyMetrics.deleteMany({
          where: {
            OR: [{ userId }, { appointmentMadeById: userId }],
          },
        });

        await prisma.workoutPlanExercise.deleteMany({
          where: {
            workoutPlan: { OR: [{ userId }, { madeByUserId: userId }] },
          },
        });
        await prisma.workoutPlan.deleteMany({
          where: { OR: [{ userId }, { madeByUserId: userId }] },
        });

        if (user.picturePublicId) {
          await deleteFromCloudinary(user.picturePublicId);
        }

        await prisma.user.delete({ where: { userId } });
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async getRoles(req, res) {
    try {
      const roles = await prisma.roles.findMany({
        select: {
          rolesId: true,
          rolesName: true,
        },
      });
      res.status(200).json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getLast7DaysUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          signatures: {
            some: {
              isActive: true,
            },
          },
        },
        select: {
          createdAt: true,
        },
      });

      const usersWithDays = users.map((user) => {
        const date = new Date(user.createdAt);
        const options = { weekday: "short" };
        const dayOfWeek = date.toLocaleDateString("pt-pt", options);

        return {
          date: user.createdAt,
          dayOfWeek: dayOfWeek,
        };
      });

      const countsByDay = usersWithDays.reduce((acc, user) => {
        acc[user.dayOfWeek] = (acc[user.dayOfWeek] || 0) + 1;
        return acc;
      }, {});

      res.status(200).json(countsByDay);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async updateProfilePicture(req, res) {
    try {
      const userId = req.params.id;
      const { profilePicture, picturePublicId, removeProfilePicture } =
        req.body;

      const user = await prisma.user.findUnique({
        where: { userId: Number(userId) },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (picturePublicId) {
        if (user.picturePublicId) {
          await deleteFromCloudinary(user.picturePublicId);
          console.log("Old picture deleted from Cloudinary");
        }
        //DEFAULT PROFILE PICTURE URL
        const defaultPorfilePictureUrl =
          "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1726180540/gym-hub/tsk6ov6eiy0auhpdfuyt.png";
        if (removeProfilePicture) {
          const updatedUser = await prisma.user.update({
            where: { userId: Number(userId) },
            data: {
              profilePictureUrl: defaultPorfilePictureUrl,
              picturePublicId: null,
            },
          });
          res.json(updatedUser);
        }
        const updatedUser = await prisma.user.update({
          where: { userId: Number(userId) },
          data: {
            profilePictureUrl: profilePicture,
            picturePublicId: picturePublicId,
          },
        });

        res.json(updatedUser);
      } else {
        const updatedUser = await prisma.user.update({
          where: { userId: Number(userId) },
          data: {
            profilePictureUrl: profilePicture,
            picturePublicId: picturePublicId,
          },
        });
        res.json(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  async getAllUsersFromTreinador(req, res) {
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
}
export default new UserController();
