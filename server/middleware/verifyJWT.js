import jwt from "jsonwebtoken";

const verifyJWT = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!decoded.userId || !decoded.role) {
        console.error("Decoded token missing userId or role:", decoded);
        return res.status(403).json({ message: "Forbidden" });
      }

      req.userId = decoded.userId;
      req.role = decoded.role;
      console.log("User ID:", req.userId, "Role:", req.role);

      console.log("User role:", req.role, "Allowed roles:", allowedRoles);

      if (!allowedRoles.includes(req.role)) {
        return res.status(403).json({ message: "Negado" });
      }

      next();
    });
  };
};

export default verifyJWT;
