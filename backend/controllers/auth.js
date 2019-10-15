import initializeDatabase from "../controllers/user.js";
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = async (req, res) => {
  const controller = await initializeDatabase();
  console.log("req.body", req.body);
  //const user = new User(req.body);
  try {
    const user = await controller.addUser(req.body);

    res.json({
      user
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err)
    });
  }
};

exports.signin = async (req, res) => {
  // find the user based on email
  const controller = await initializeDatabase();
  const { email, password } = req.body;
  const user = await controller.getuserByUsername({ email, password });

  if (!user) {
    return res.status(400).json({
      error: "User with that email does not exist. Please signup"
    });
  }
  // if user is found make sure the email and password match
  // create authenticate method in user model
  // if (!user.authenticate(password)) {
  //     return res.status(401).json({
  //         error: "Email and password dont match"
  //     });
  // }
  // generate a signed token with user id and secret
  const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
  // persist the token as 't' in cookie with expiry date
  res.cookie("t", token, { resetTokenExpiry: new Date() + 9999 });
  // return response with user and token to frontend client
  const { id, name, per_id } = user;
  return res.json({ token, user: { id, email, name, per_id } });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success", message: true });
};

// exports.requireSignin = expressJwt({
//     secret: process.env.JWT_SECRET,
//     userProperty: "auth"
// });

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.per_id === 0) {
    return res.status(403).json({
      error: "Admin resourse! Access denied"
    });
  }
  next();
};
