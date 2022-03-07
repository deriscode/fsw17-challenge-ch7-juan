require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./models");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const initializePassport = require("./utils/passportConfig");

// Menyimpan sesi login dll di database
const SessionStore = require("express-session-sequelize")(session.Store);
const sequelizeSessionStore = new SessionStore({
	db: db.sequelize,
});

// Inisialisasi passport js agar bisa digunakan
initializePassport(passport);

// Middleware untuk menerima data dari body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk membuat folder public menjadi statis agar dapat diakses secara global
app.use(express.static(__dirname + "/public"));

// Setup session untuk mengirim cookies yg digunakan untuk flash & passport
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		// Untuk simpan session ke database
		store: sequelizeSessionStore,
	})
);

// Middleware inisialisasi passport sesuai konfigurasi di initializePassport(passport)
app.use(passport.initialize());
app.use(passport.session());

// Middleware untuk menampilkan alert notifikasi
app.use(flash());

// Middleware untuk render html
app.set("view engine", "ejs");
app.set("views", "./views");

const playerRouter = require("./routes/playerRouter");

// Route untuk Player
app.use(playerRouter);

// Middleware untuk handle 404 Not Found baik dari halaman maupun data
// app.use((req, res) => {
// 	res.status(404).render("error", {
// 		title: "404 Not Found",
// 		pageTitle: "404",
// 	});
// });

// Menyambungkan DB & Localhost
const PORT = process.env.PORT || 4400;
db.sequelize
	.sync({
		// force: true,
	})
	.then(() => {
		console.log("====================================");
		console.log("Database Connected");
		console.log("====================================");
		app.listen(PORT, () => {
			console.log("====================================");
			console.log(`Server is running at port ${PORT}`);
			console.log("====================================");
		});
	})
	.catch((error) => {
		console.log(error);
	});
