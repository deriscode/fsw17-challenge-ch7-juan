const router = require("express").Router();
const {
	Register,
	RegisterFunction,
	Login,
	Dashboard,
	DashboardCreate,
	DashboardCreateFunction,
	DashboardEdit,
	DashboardEditFunction,
	DeletePlayerFunction,
	Logout,
} = require("../controller/adminController");

const passport = require("passport");

const { checkAdminAuthenticated, checkAdminNotAuthenticated } = require("../middleware/authenticate");

// Menampilkan Halaman Admin Register (READ)
router.get("/admin/register", checkAdminNotAuthenticated, Register);

// Menampilkan Halaman Login (READ)
router.get("/admin/login", checkAdminNotAuthenticated, Login);

// Menampilkan Halaman Dashboard (READ)
router.get("/admin/dashboard", checkAdminAuthenticated, Dashboard);

// Menampilkan Halaman Create (READ)
router.get("/admin/create", checkAdminAuthenticated, DashboardCreate);

// Menampilkan Halaman Edit (READ)
router.get("/admin/edit/:id", checkAdminAuthenticated, DashboardEdit);

// Membuat Akun (CREATE)
router.post("/admin/register", checkAdminNotAuthenticated, RegisterFunction);

// Membuat Player Baru (CREATE)
router.post("/admin/create", checkAdminAuthenticated, DashboardCreateFunction);

// Melakukan Perubahan Data (UPDATE)
router.post("/admin/edit/:id", checkAdminAuthenticated, DashboardEditFunction);

// Menghapus Data (DELETE)
router.post("/admin/delete/:id", checkAdminAuthenticated, DeletePlayerFunction);

// Melakukan Login (AUTENTIKASI MASUK)
router.post(
	"/admin/login",
	checkAdminNotAuthenticated,
	passport.authenticate("admin", { failureRedirect: "/admin/login", failureFlash: true }),
	(req, res) => {
		res.redirect(`/admin/dashboard`);
	}
);

// Melakukan Logout (AUTENTIKASI KELUAR)
router.get("/admin/logout", Logout);

module.exports = router;
