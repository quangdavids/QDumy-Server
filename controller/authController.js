const User = require("../model/userSchema.js");
const bcrypt = require("bcrypt");

const { generateToken } = require("../config/jwt");


const register = async (req, res) => {
  try {
    const { username, email, password, profileImg, role } = req.body;

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already exists" });;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileImg,
      authProvider: "email",
      role
    });

    if (user) {
      await user.save();



      const token = generateToken(
        { userId: user._id },
        res,
      );

      res.status(200).json({
        message: "User succesfully created",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profileImg: user.profileImg,
          authProvider: user.authProvider,
          role: user.role
        },
        token: token,
      });
    } else {
      res.status(400).json("Invalid credentials");
    }
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "Error in creating user", error: error.message || "Unknown error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const findUser = await User.findOne({ username });

    
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (findUser.blockExpiresAt && findUser.blockExpiresAt > new Date()) {
      return res.status(403).json({message: "Account is currently suspended"})
    }
    const isPasswordMatch = await bcrypt.compare(password, findUser.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }



    const token = generateToken(
      { userId: findUser._id },
      res,
    );

    res.status(200).json({
      message: "Successfully login",
      user: {
        _id: findUser._id,
        username: findUser.username,
        email: findUser.email,
        profileImg: findUser.profileImg,
        authProvider: findUser.authProvider,
        role: findUser.role,
      },
      token: token,
     
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Failed to login", error: e.message || "Unknown error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    console.log(e.message);
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const refreshTokenFromCookie = req.cookies.refreshToken;

    const token = refreshToken || refreshTokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.userId;

    // Generate new access token
    const { generateAccessToken } = require("../config/jwt");
    const newAccessToken = generateAccessToken(userId);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  // googleLogin,
};
