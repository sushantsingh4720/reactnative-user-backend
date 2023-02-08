import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import path from "path";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import {
  signUpBodyValidation,
  logInBodyValidation,
} from "../utils/validationSchema.js";
const signUp = async (req, res) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    const email = req.body.email.replace(/\//g, "").toLowerCase();
    req.body = { ...req.body, email };

    const oldUser = await User.findOne({ email });
    if (oldUser)
      return res.status(409).json({
        error: true,
        message: "Userwith given email already exist",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({ ...req.body, password: hashPassword });
    const token = await generateToken(user);

    res.status(201).json({
      error: false,
      success: true,
      token,
      user,
      message: "Account created sucessfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { error } = logInBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    const email = req.body.email.replace(/\//g, "").toLowerCase();

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "No User found with given email" });

    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifiedPassword)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });

    const token = await generateToken(user);

    res.status(200).json({
      error: false,
      token,
      user,
      message: "Logged in sucessfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/user/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
const forgotPassword = async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ error: true, message: "Email is missing" });
  const email = req.body.email.replace(/\//g, "").toLowerCase();
  let resetToken = crypto.randomBytes(20).toString("hex");
  let resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken,
        resetPasswordExpires: Date.now() + 300000,
      },
      { new: true }
    );
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "No User found with given email" });
    let link = `https://${req.headers.host}/api/user/reset/${user.resetPasswordToken}`;
    console.log(link);
    const mailOptions = {
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
      to: user.email,
      subject: "Password change request",
      html: `<p>Hi ${user.name} <br>Please click on the following <a href=${link}>link</a> to reset your password. <br><br>If you did not request this, please ignore this email and your password will remain unchanged.<br></p>`,
    };
    sendEmail(mailOptions);
    res
      .status(200)
      .json({ error: false, message: "A reset email has been sent" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// @route GET api/user/reset/:token
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
const reset = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.send("Password reset token is invalid or has expired.");
    const __dirname = path.resolve();
    res.sendFile(__dirname + "/reset.html");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/user/resetpassword/:token
// @desc Reset Password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      {
        password: hashPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { new: true }
    );
    if (!user)
      return res.send("Password reset token is invalid or has expired.");
    const mailOptions = {
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
      to: user.email,
      subject: "Your password has been changed",
      text: `Hi ${user.name} \nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };
    sendEmail(mailOptions);
    res.send("Your password has been updated.");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// @route Get api/user/profile
// @desc View profile information
// @access authenticated
const profileView = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires -__v"
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/user/profile/updateprofile
// @desc Update Profile Information
// @access authenticated
const updateProfile = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      req.body = { ...req.body, password: hashPassword };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

const generateToken = async (user) => {
  try {
    const payload = { _id: user._id };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "30d",
    });

    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
};
export {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  reset,
  profileView,
  updateProfile,
};
