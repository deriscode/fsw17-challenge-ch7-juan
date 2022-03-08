const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/error");

// Untuk verifikasi token Player
const verifyTokenGame = (req, res, next) => {
	try {
		let tokenHeader = req.headers["authorization"];

		// Check apakah token dikirim lewat header
		if (!tokenHeader) {
			return errorHandler(401, "Tidak Ada Token yang Dikirim", res);
		} else {
			// Membuang tulisan Bearer yg ada dalam token
			let token = tokenHeader.split(" ")[1];

			// Buka kunci token yg sudah dikunci dengan method jwt.sign
			// Kuncinya diambil dari .env
			// Decoded adalah data dari token yg sudah dibuka dengan secret
			jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
				if (error) {
					// kasih error jika proses buka kunci gagal, atau token sudah expired
					return errorHandler(403, error.message, res);
				} else {
					// simpan data user ke req.user & dapat diakses semua controller yg memiliki middleware verifyToken
					req.user = decoded;
					next();
				}
			});
		}
	} catch (error) {
		console.log("===============verifyToken=====================");
		console.log(error);
		console.log("===============verifyToken=====================");
		return errorHandler(400, error.message, res);
	}
};

module.exports = verifyTokenGame;
