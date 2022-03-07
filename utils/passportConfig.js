const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Import model User dari sequelize
const { User } = require("../models");

const initializePassport = (passport) => {
	// Fungsi untuk mendefinisikan cara login
	const authenticateUser = (email, password, done) => {
		User.findOne({
			where: {
				email: email,
			},
		})
			.then((userData) => {
				if (userData) {
					bcrypt.compare(password, userData.password, (error, isMatch) => {
						if (isMatch) {
							return done(null, userData);
						} else {
							return done(null, false, { message: "Password Salah" });
						}
					});
				} else {
					return done(null, false, { message: "Email Tidak Terdaftar" });
				}
			})
			.catch((error) => {
				return done(error);
			});
	};

	passport.use(
		new LocalStrategy(
			{
				usernameField: "email",
				passwordField: "password",
			},
			authenticateUser
		)
	);

	// Untuk menyimpan user yang login di dalam session
	passport.serializeUser((user, done) => done(null, user.uuid));

	// Untuk menghapus sesi login / melakukan logout
	passport.deserializeUser(async (id, done) => {
		const userDeserialize = await User.findOne({
			where: {
				uuid: id,
			},
		});

		return done(null, userDeserialize);
	});
};

module.exports = initializePassport;