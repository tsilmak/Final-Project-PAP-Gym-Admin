import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.SECRET;
if (!SECRET) {
  throw new Error("SECRET environment variable is not defined");
}

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt, password) => {
  return crypto
    .createHmac("sha256", SECRET)
    .update([salt, password].join("/"))
    .digest("base64");
};
