const router = require("express").Router();
const {
	Main,
	Register,
	RegisterFunction,
	Login,
	Profile,
	ProfileUpdateFunction,
	DeletePlayerFunction,
	Logout,
} = require("../controller/playerController");

const passport = require("passport");

const { checkPlayerAuthenticated, checkPlayerNotAuthenticated } = require("../middleware/authenticate");

// Menampilkan Halaman Utama (READ)
router.get("/", Main);

// Menampilkan Halaman Login (READ)
router.get("/login", checkPlayerNotAuthenticated, Login);

// Menampilkan Halaman Register (READ)
router.get("/register", checkPlayerNotAuthenticated, Register);

// Menampilkan Halaman Profil (READ)
router.get("/profile/:id", checkPlayerAuthenticated, Profile);

// Membuat Akun (CREATE)
router.post("/register", checkPlayerNotAuthenticated, RegisterFunction);

// Mengubah Informasi Akun (UPDATE)
router.post("/profile/:id", checkPlayerAuthenticated, ProfileUpdateFunction);

// Menghapus Akun (DELETE)
router.post("/delete/:id", checkPlayerAuthenticated, DeletePlayerFunction);

// Melakukan Login (AUTENTIKASI MASUK)
router.post(
	"/login",
	checkPlayerNotAuthenticated,
	passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
	(req, res) => {
		if (req.user.role === "PLAYER") {
			res.redirect(`/profile/${req.user.uuid}`);
		} else {
			req.flash("error", "Anda Tidak Memiliki Akses Untuk Login");
			const { success, error } = req.flash();

			res.render("login", {
				headTitle: "Login",
				success,
				error,
			});
		}
	}
);

// Melakukan Logout (AUTENTIKASI KELUAR)
router.post("/logout", Logout);

module.exports = router;
