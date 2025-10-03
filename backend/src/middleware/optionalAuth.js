import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;
        if (!token) {
            req.user = null;
            return next(); // no token, just continue
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            req.user = null;
            return next();
        }

        const user = await User.findById(decoded.userId).select("-password");
        req.user = user || null;

        next();
    } catch (error) {
        console.log("Error in optionalAuth middleware:", error);
        req.user = null; // fail gracefully instead of blocking
        next();
    }
};
