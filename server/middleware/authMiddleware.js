import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    console.log("Authorization:", req.headers.authorization);

    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      console.log("No token");
      return res.status(401).json({
        success: false,
        message: "No Token",
      });
    }

    token = token.split(" ")[1];

    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    console.log("User:", user);

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (err) {
    console.log("Middleware Error:", err);
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};