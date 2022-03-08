const { User, Biodata, History } = require("../models");
const bcrypt = require("bcrypt");

// Controller untuk menampilkan halaman utama
const Main = (req, res) => {
	const { success, error } = req.flash();
	try {
		res.render("main", {
			headTitle: "Home",
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk menampilkan halaman register
const Register = (req, res) => {
	try {
		const { success, error } = req.flash();

		res.render("register", {
			headTitle: "Register",
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk melakukan registrasi
const RegisterFunction = async (req, res) => {
	try {
		if (req.body.password1 !== req.body.password2) {
			req.flash("error", "Password Tidak Sama");
			res.redirect("/register");
		} else {
			const newPlayer = await User.create({
				username: req.body.username,
				email: req.body.email,
				password: req.body.password1,
				role: "PLAYER",
			});

			await Biodata.create({
				age: 0,
				address: req.body.address,
				city: req.body.city,
				user_uuid: newPlayer.uuid,
			});

			await History.create({
				win: req.body.win,
				lose: req.body.lose,
				draw: req.body.draw,
				user_uuid: newPlayer.uuid,
			});

			req.flash("success", "Berhasil Registrasi. Silahkan Login");
			res.redirect("/login");
		}
	} catch (error) {
		req.flash("error", error.message);
		console.log("====================================");
		console.log(error);
		console.log("====================================");
		res.redirect("/register");
	}
};

// Controller untuk menampilkan halaman login
const Login = (req, res) => {
	try {
		const { success, error } = req.flash();

		res.render("login", {
			headTitle: "Login",
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk menampilkan halaman profile player
const Profile = async (req, res) => {
	try {
		const { success, error } = req.flash();

		const playerSelected = await User.findOne({
			where: {
				uuid: req.params.id,
			},
			include: ["biodata", "history"],
		});

		res.render("profile", {
			headTitle: "Profile",
			data: playerSelected,
			username: req.user ? req.user.username : null,
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk melakukan update/edit player
const ProfileUpdateFunction = async (req, res) => {
	const { username, email, password, age, address, city, win, lose, draw } = req.body;

	try {
		const playerToUpdate = await User.findByPk(req.params.id);

		if (playerToUpdate) {
			const biodataToUpdate = await Biodata.findOne({
				where: {
					user_uuid: req.params.id,
				},
			});

			const updatedBiodata = await biodataToUpdate.update({
				age: age === "" ? biodataToUpdate.age : age,
				address: address,
				city: city,
			});

			const historyToUpdate = await History.findOne({
				where: {
					user_uuid: req.params.id,
				},
			});

			const updatedHistory = await historyToUpdate.update({
				win: win === "" ? historyToUpdate.win : win,
				lose: lose === "" ? historyToUpdate.lose : lose,
				draw: draw === "" ? historyToUpdate.draw : draw,
			});

			const updated = await playerToUpdate.update({
				username: username ?? playerToUpdate.username,
				email: email ?? playerToUpdate.email,
				password: password === "" ? playerToUpdate.password : bcrypt.hashSync(password, 10),
			});

			req.flash("success", "Update Berhasil");
			res.redirect(`/profile/${updated.uuid}`);
		}
	} catch (error) {
		req.flash("error", error.message);
		console.log("====================================");
		console.log(error);
		console.log("====================================");
		res.redirect(`/profile/${updated.uuid}`);
	}
};

// Controller untuk menghapus akun player
const DeletePlayerFunction = async (req, res) => {
	try {
		const playerToDelete = await User.findByPk(req.params.id);

		if (playerToDelete) {
			await Biodata.destroy({
				where: {
					user_uuid: req.params.id,
				},
			});

			await History.destroy({
				where: {
					user_uuid: req.params.id,
				},
			});

			const deleted = await User.destroy({
				where: {
					uuid: req.params.id,
				},
			});

			req.flash("success", "Akun Berhasil Dihapus");
			res.redirect("/");
		}
	} catch (error) {
		req.flash("error", error.message);
		console.log("====================================");
		console.log(error);
		console.log("====================================");
		res.redirect("/");
	}
};

// Controller untuk melakukan logout
const Logout = (req, res) => {
	req.logout();
	res.redirect("/login");
};

module.exports = {
	Main,
	Register,
	RegisterFunction,
	Login,
	Profile,
	ProfileUpdateFunction,
	DeletePlayerFunction,
	Logout,
};
