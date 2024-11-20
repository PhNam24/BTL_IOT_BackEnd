const express = require("express");
const {
  login,
  register,
  getAllUser,
  updateUser,
  deleteUser,
} = require("../controller/UserController");

const router = express.Router();

router.get("/", getAllUser);
router.post("/login", login);
router.post("/register", register);
router.put("/edit/:username", updateUser);
router.delete("/delete/:username", deleteUser);

module.exports = router;
