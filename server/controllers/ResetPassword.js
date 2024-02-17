const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req body 
        const email = req.body.email;
        // check user for this email and validation 
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            })
        }
        //generate token 
        const token = crypto.randomUUID();
        //search user with email update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            //change yeh karna hai 
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );
        //create url 
        const url = `http://localhost:3000/update-password/${token}`
        //send mail containing the url 
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )
        //return response 
        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
            message: `Some Error in Sending the Reset Message`,
        })
    }
}

//reset password
exports.resetPassword = async (req, res) => {
    try {
        //fetch data request from body 
        const { password, confirmPassword, token } = req.body;
        //validation of password 
        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            })
        }
        //get user details from DB using token 
        const userDetails = await User.findOne({ token: token })
        //if no entry found then Invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            })
        }
        //token time check 
        if (!(userDetails.resetPasswordExpires < Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            });
        }
        // hashed pasword 
        const encryptedPassword = await bcrypt.hash(password, 10)
        await User.findOneAndUpdate(
            //search on basis of token 
            { token: token },
            //and update this passowrd 
            { password: encryptedPassword },
            { new: true }
        )
        //return response 
        res.json({
            success: true,
            message: `Password Reset Successful`,
        })

    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Updating the Password`,
        })
    }
}

