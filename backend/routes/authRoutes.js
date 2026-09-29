const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        message: "Auth route working!"
    });
});

router.post("/register", registerUser);

router.post("/login", loginUser);

module.exports = router;