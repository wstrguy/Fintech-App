const jwt = require("jsonwebtoken");

const createJWT = ({ id, email, firstname }) => {
  return jwt.sign({ id, email, firstname }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};




module.exports = createJWT;