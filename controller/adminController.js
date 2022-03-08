const { User, Biodata, History } = require("../models");
const bcrypt = require("bcrypt");

// Controller untuk menampilkan halaman register
const Register = (req, res) => {
	try {
		const { success, error } = req.flash();

		res.render("adminForm", {
			headTitle: "Admin Register",
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
			res.redirect("/admin/register");
		} else {
			const newPlayer = await User.create({
				username: req.body.username,
				email: req.body.email,
				password: req.body.password1,
				role: "ADMIN",
			});

			await Biodata.create({
				age: req.body.age,
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
			res.redirect("/admin/login");
		}
	} catch (error) {
		req.flash("error", error.message);
		console.log("====================================");
		console.log(error);
		console.log("====================================");
		res.redirect("/admin/register");
	}
};

// Controller untuk menampilkan halaman login
const Login = (req, res) => {
	try {
		const { success, error } = req.flash();

		res.render("adminForm", {
			headTitle: "Admin Login",
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk menampilkan halaman dashboard
const Dashboard = async (req, res) => {
	try {
		const { success, error } = req.flash();

		const page = Number(req.query.page) || 1;
		const itemPerPage = 6;

		const playerList = await User.findAndCountAll({
			where: {
				role: "PLAYER",
			},
			include: ["biodata", "history"],
			order: [["createdAt", "DESC"]],
			limit: itemPerPage,
			offset: (page - 1) * itemPerPage,
		});

		console.log("====================================");
		console.log(playerList);
		console.log("====================================");

		res.render("dashboard", {
			headTitle: "Admin Dashboard",
			data: playerList.rows,
			username: req.user ? req.user.username : null,
			currentPage: page,
			totalPage: Math.ceil(playerList.count / itemPerPage),
			nextPage: page + 1,
			prevPage: page - 1 == 0 ? 1 : page - 1,
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk menampilkan halaman create
const DashboardCreate = (req, res) => {
	try {
		const { success, error } = req.flash();

		res.render("adminForm", {
			headTitle: "Admin Create",
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk membuat player baru
const DashboardCreateFunction = async (req, res) => {
	try {
		const newPlayer = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			role: "PLAYER",
		});

		await Biodata.create({
			age: req.body.age === "" ? 0 : req.body.age,
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

		req.flash("success", "Berhasil Membuat Player Baru");
		res.redirect("/admin/dashboard");
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk menampilkan halaman edit
const DashboardEdit = async (req, res) => {
	try {
		const { success, error } = req.flash();

		const playerSelected = await User.findOne({
			where: {
				uuid: req.params.id,
			},
			include: ["biodata", "history"],
		});

		res.render("adminForm", {
			headTitle: "Admin Edit",
			data: playerSelected,
			success,
			error,
		});
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
	}
};

// Controller untuk melakukan edit
const DashboardEditFunction = async (req, res) => {
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
			res.redirect("/admin/dashboard");
		}
	} catch (error) {
		console.log("====================================");
		console.log(error);
		console.log("====================================");
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
			res.redirect("/admin/dashboard");
		}
	} catch (error) {
		req.flash("error", error.message);
		console.log("====================================");
		console.log(error);
		console.log("====================================");
		res.redirect("/admin/dashboard");
	}
};

// Controller untuk melakukan logout
const Logout = (req, res) => {
	req.logout();
	res.redirect("/admin/login");
};

module.exports = {
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
};
