const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets");

const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      const token = generateToken(saved);
      console.log("token", saved);
      res.status(201).json({ message: `Welcome ${saved.username}!`, token });
    })
    .catch(error => {
      console.log("random");
      res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({
          message: `Welcome ${user.username}!, I have a token`,
          token
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.get("/logout", (req, res) => {
  if (token) {
    token.destroy(err => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.status(200).json({ message: "Bye, thanks for visiting" });
      }
    });
  } else {
    res.status(200).json({ message: "Bye, thanks for visiting" });
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    department: user.department
  };

  const options = {
    expiresIn: "1d"
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}
module.exports = router;
