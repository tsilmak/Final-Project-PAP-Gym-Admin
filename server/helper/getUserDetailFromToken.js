import jwt from "jsonwebtoken";

const getUserDetailsFromToken = (token) => {
  if (!token) {
    console.log("No token provided");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error.message);
    return null;
  }
};

export default getUserDetailsFromToken;
