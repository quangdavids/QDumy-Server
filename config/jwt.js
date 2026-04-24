const jwt = require('jsonwebtoken')

// Generate access token (60 days expiration)
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET,
    { expiresIn: "14d" }
  );
}

// Generate single token for login/register
const generateToken = (payload, res) => {
  const token = generateAccessToken(payload);

  // Store token in httpOnly cookie
  res.cookie("jwt", token, {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    sameSite: 'None',
    httpOnly: true,
    secure: true
  });

  return token;
}

module.exports = { 
  generateToken, 
  generateAccessToken
}