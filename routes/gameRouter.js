const router = require("express").Router();
const { Register, Login, CreateRoom, PlayGameRoom } = require("../controller/gameController");
const verifyTokenGame = require("../middleware/verifyTokenGame");

// Untuk melakukan register
router.post("/game/register", Register);

// Untuk melakukan login
router.post("/game/login", Login);

// Untuk create room baru
router.post("/room/create", verifyTokenGame, CreateRoom);

// Untuk bermain game
router.post("/room/play", verifyTokenGame, PlayGameRoom);

module.exports = router;
