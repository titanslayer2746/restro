const createHttpError = require("http-errors");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isVerifiedUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            const error = createHttpError(401, "Unauthorized user");
            return next(error);
        }

        const verifiedUser = jwt.verify(token, config.accessTokenSecret);
        if (!verifiedUser) {
            const error = createHttpError(401, "Unauthorized user");
            return next(error);
        }

        const user = await User.findById(verifiedUser._id);
        if(!user) {
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        req.user = user;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid token");
        next(err);
    }
}

// Use after isVerifiedUser
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "Admin") {
        return next(createHttpError(403, "Only admins can do this"));
    }
    next();
}

// Use after isVerifiedUser, e.g. hasRole("Cashier", "Admin")
const hasRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return next(createHttpError(403, `Only ${roles.join(" or ")} can do this`));
    }
    next();
}

module.exports = {isVerifiedUser, isAdmin, hasRole};