const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
    try {
        // Extracting JWT from request cookies, body, or header
        const token = req.cookies.token || req.body.token || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));

        // If JWT is missing, return 401 Unauthorized response
        if (!token) {
            return res.status(401).json({ success: false, message: `Token Missing` });
        }

        try {
            // Verifying the JWT using the secret key stored in environment variables
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Storing the decoded JWT payload in the request object for further use
            req.user = decoded;
            
            // If JWT is valid, move on to the next middleware or request handler
            next();
        } catch (error) {
            // If JWT verification fails, return 401 Unauthorized response
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } catch (error) {
        // If there is an error during the authentication process, return 401 Unauthorized response
        return res.status(401).json({ success: false, message: `Something went wrong while validating the token` });
    }
};

//isStudent 
exports.isStudent = async (req, res, next) => {
    try {

        if (req.user.accountType != "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Students",
            });
        }
        next();
        // const userDetails = await User.findOne({ email: req.user.email });

        // if (userDetails.accountType !== "Student") {
        //     return res.status(401).json({
        //         success: false,
        //         message: "This is a Protected Route for Students",
        //     });
        // }
        // next();
    } catch (error) {
        return res
            .status(500).json({
                success: false,
                message: `User Role Can't be Verified`
            });
    }
};

//isInstructor 
exports.isInstructor = async (req, res, next) => {
    try {
        // Check if req.user is defined and has the accountType property
        if (!req.user || !req.user.accountType) {
            return res.status(500).json({
                success: false,
                message: "User account type is missing",
            });
        }

        // Check if the user's account type is "Instructor"
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructors",
            });
        }

        // If the user is an instructor, proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle any unexpected errors
        return res.status(500).json({
            success: false,
            message: "Error verifying user role",
            error: error.message,
        });
    }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {

        if (req.user.accountType != "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500).json({
                success: false,
                message: `User Role Can't be Verified`
            });
    }
};