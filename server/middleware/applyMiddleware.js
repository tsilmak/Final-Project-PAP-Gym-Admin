const applyMiddleware = (route, middleware) => {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      route(req, res, next);
    });
  };
};

export { applyMiddleware };
