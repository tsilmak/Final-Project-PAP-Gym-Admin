import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { authentication } from "../helper/authentication.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email ou password não fornecidas." });
    }

    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          hashedPassword: true,
          salt: true,
          userId: true,
          fname: true,
          lname: true,
          profilePictureUrl: true,
          role: { select: { rolesName: true } },
        },
      });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Credenciais de acesso inválidas" });
      }

      const { salt, hashedPassword } = user;
      const hashedInputPassword = authentication(salt, password);

      if (hashedInputPassword !== hashedPassword) {
        return res
          .status(401)
          .json({ message: "Credenciais de acesso inválidas." });
      }

      if (
        user.role.rolesName !== "Administrador" &&
        user.role.rolesName !== "Nutricionista" &&
        user.role.rolesName !== "Treinador"
      ) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      // Generate Access and Refresh Tokens
      const accessToken = jwt.sign(
        {
          userId: user.userId,
          role: user.role.rolesName,
          fname: user.fname,
          lname: user.lname,
          profilePicture: user.profilePictureUrl,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "30d",
        }
      );
      // Set the new refresh token as an HttpOnly cookie
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        user: {
          userId: user.userId,
          fname: user.fname,
          lname: user.lname,
          profilePicture: user.profilePictureUrl,
          role: user.role.rolesName,
        },
      });

      // Send access token and other user information
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async refresh(req, res) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      asyncHandler(async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Forbidden" });

        const user = await prisma.user.findUnique({
          // Ensure you're using the Prisma client
          where: { userId: decoded.userId }, // Assuming decoded contains userId, adjust if necessary
          select: {
            userId: true,
            role: { select: { rolesName: true } },
            fname: true,
            lname: true,
            profilePictureUrl: true,
          },
        });

        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const accessToken = jwt.sign(
          {
            userId: user.userId,
            role: user.role.rolesName,
            fname: user.fname,
            lname: user.lname,
            profilePicture: user.profilePictureUrl,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30m" }
        );

        res.json({
          accessToken,
          user: {
            userId: user.userId,
            fname: user.fname,
            lname: user.lname,
            profilePicture: user.profilePictureUrl,
            role: user.role.rolesName,
          },
        });
      })
    );
  }

  async logout(req, res) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.json({ message: "Cookie cleared" });
  }
}

export default new AuthController();
