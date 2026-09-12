const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const ROLES = ["Waiter", "Cashier", "Admin"];

const register = async (req, res, next) => {
    try {
        // Any role sent by the client is ignored: people can't make themselves admins
        const { name, phone, email, password } = req.body;
        if (!name || !email || !password || !phone) {
            const error = createHttpError(400, "All fields are required!")
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exists!")
            return next(error);
        }

        // The very first account becomes the admin so someone can manage roles.
        // Everyone after that starts as a waiter until an admin changes it.
        const isFirstUser = (await User.estimatedDocumentCount()) === 0;
        const role = isFirstUser ? "Admin" : "Waiter";

        const user = {name, phone, email, password, role};
        const newUser = User(user);
        await newUser.save();
    
        res.status(201).json({
            success: true,
            message: isFirstUser
                ? "Account created. You're the first user, so you're the admin."
                : "Account created! You start as a Waiter; an admin can change your role.",
            user: newUser
        });

    } catch (error) {
        next(error);
    }
}


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = createHttpError(400, "All fields are required!")
            return next(error);
        }
        const isUserPresent = await User.findOne({ email });
        if (!isUserPresent) {
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isMatch) {
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn: "1d"
        });

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: "none",
            secure: true
        })

        res.status(200).json({
            success: true,
            message: "User login successfully!",
            data: isUserPresent
        })

    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.status(200).json({
            success: true,
            message: "User data fetched successfully!",
            data: user
        })
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });
        res.status(200).json({success: true, message: "User logout successfull"});
        
    } catch (error) {
        next(error);
    }
}

// Admin: everyone on staff, newest first
const getStaff = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: "Staff fetched successfully!", data: users });
    } catch (error) {
        next(error);
    }
}

// Admin: change someone's role
const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, "Invalid user ID"));
        }
        if (!ROLES.includes(role)) {
            return next(createHttpError(400, `Role must be one of: ${ROLES.join(", ")}`));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        // Never leave the restaurant without an admin
        if (user.role === "Admin" && role !== "Admin") {
            const admins = await User.countDocuments({ role: "Admin" });
            if (admins <= 1) {
                return next(createHttpError(400, "There must be at least one admin"));
            }
        }

        // updateOne skips the save hook, so the password is untouched
        await User.updateOne({ _id: id }, { $set: { role } });
        user.role = role;

        res.status(200).json({ success: true, message: `${user.name} is now ${role === "Admin" ? "an" : "a"} ${role}`, data: user });
    } catch (error) {
        next(error);
    }
}

module.exports = { register , login , getUserData, logout, getStaff, updateRole };