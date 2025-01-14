import pkg from "jsonwebtoken";
const { verify } = pkg;

// Middleware to authenticate token for Socket.IO
const authenticateTokenWebScoket = (socket, next) => {
  const token = socket.handshake.auth.token; // Access the token from the auth object

  if (!token) {
    return next(new Error("Unauthorized")); // Handle missing token
  }

  verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error("Forbidden")); // Handle token verification error
    }
    socket.user = user; // Attach the decoded user object to the socket
    next(); // Proceed with the connection
  });
};

export { authenticateTokenWebScoket };
