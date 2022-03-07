// Pemeriksaan jika user player sudah login
const checkPlayerAuthenticated = (req, res, next) => {
	if (req.isAuthenticated() && req.user.role == "PLAYER") {
		next();
	} else {
		res.redirect("/login");
	}
};

// Pemeriksaan jika user player tidak login
const checkPlayerNotAuthenticated = (req, res, next) => {
	// Pemeriksaan agar user player tidak bisa login atau register lagi, dalam kondisi sudah login
	if (req.isAuthenticated() && req.user.role == "PLAYER") {
		res.redirect(`/profile/${req.user.uuid}`);
	} else {
		next();
	}
};

module.exports = {
	checkPlayerAuthenticated,
	checkPlayerNotAuthenticated,
};
