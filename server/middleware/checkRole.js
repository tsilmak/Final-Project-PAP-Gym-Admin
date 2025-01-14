const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    return res.status(403).json({ message: "Negado" });
  };
};

export default checkRole;
