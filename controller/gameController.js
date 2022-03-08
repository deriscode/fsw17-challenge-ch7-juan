const { User, History, Biodata, Room } = require("../models");
const bcrypt = require("bcrypt");
const errorHandler = require("../utils/error");
const jwt = require("jsonwebtoken");
const user = require("../models/user");

// Controller untuk melakukan registrasi
const Register = async (req, res) => {
	try {
		if (req.body.password1 !== req.body.password2) {
			return errorHandler(400, "Password Tidak Sama", res);
		} else {
			const newPlayer = await User.create({
				username: req.body.username,
				email: req.body.email,
				password: req.body.password1,
				role: req.body.role,
			});

			await History.create({
				user_uuid: newPlayer.uuid,
			});

			// Biar bisa login di bagian MVC, karena waktu di-test ada error jika age-nya tidak memiliki nilai
			await Biodata.create({
				user_uuid: newPlayer.uuid,
				age: 0,
			});

			res.json({
				message: "Player Created Successfully",
			});
		}
	} catch (error) {
		console.log("===============REGISTER=====================");
		console.log(error);
		console.log("===============REGISTER=====================");
		return errorHandler(500, error.message, res);
	}
};

// Controller untuk login
const Login = async (req, res) => {
	try {
		if (!req.body.email) {
			return errorHandler(400, "Harap Masukkan Email", res);
		}

		// Mengecek email yg di-input user, apakah sama dengan di database
		const player = await User.findOne({
			where: {
				email: req.body.email.toLowerCase(),
			},
		});

		// Jika tidak ada yg sama, dikasih error
		if (!player) {
			return errorHandler(404, "Email Tidak Ditemukan", res);
		}

		// Check password di database & input-an user
		let passwordIsValid = bcrypt.compareSync(req.body.password, player.password);

		// Jika salah dikasih error
		if (!passwordIsValid) {
			return errorHandler(400, "Password Salah", res);
		}

		// Mengunci data user dengan jwt
		let token = jwt.sign(
			{
				// Objek yg ingin dikunci
				player_id: player.uuid,
				role: player.role,
				username: player.username,
			},
			process.env.JWT_SECRET, // Nama kuncinya
			{
				expiresIn: 86400, // Masa waktu 24 jam
			}
		);

		res.status(200).json({
			message: `Selamat Datang, ${player.username}`,
			role: player.role,
			token: token,
		});
	} catch (error) {
		console.log("===============LOGIN=====================");
		console.log(error);
		console.log("===============LOGIN=====================");
		return errorHandler(500, error.message, res);
	}
};

const CreateRoom = async (req, res) => {
	try {
		const roomName = req.body.room_name;
		const player = req.user;

		if (!roomName) {
			return errorHandler(400, "Mohon Input Nama Room", res);
		}

		const newRoom = await Room.create({
			room_name: roomName,
			owned_by: player.player_id,
		});

		res.status(201).json({
			status: "SUCCESS",
			message: "New Room Created",
			room_name: newRoom.room_name,
		});
	} catch (error) {
		console.log("===============CREATE ROOM=====================");
		console.log(error);
		console.log("===============CREATE ROOM=====================");
		return errorHandler(500, error.message, res);
	}
};

const PlayGameRoom = async (req, res) => {
	try {
		const playerChoices = req.body.choices;
		const room = req.body.room_name;

		if (!playerChoices) {
			return errorHandler(400, "Mohon Masukkan Pilihan Anda", res);
		}

		if (!Array.isArray(playerChoices)) {
			return errorHandler(400, "Mohon Masukkan Pilihan Anda Dalam Bentuk Array", res);
		}

		if (playerChoices.length != 3) {
			return errorHandler(400, "Mohon Masukkan 3 Pilihan", res);
		}

		if (!room) {
			return errorHandler(400, "Mohon Input Nama Room", res);
		}

		const foundRoom = await Room.findOne({
			where: {
				room_name: room.toLowerCase(),
			},
		});

		if (!foundRoom) {
			return errorHandler(404, "Room Tidak Ditemukan", res);
		} else {
			// Jika slot player 1 masih kosong, maka player yg posting rps duluan jadi player 1
			if (!foundRoom.player_1_uuid) {
				await foundRoom.update({
					player_1_choices: playerChoices,
					player_1_uuid: req.user.player_id,
				});
			} else if (!foundRoom.player_2_uuid) {
				// Karena player 1 sudah diisi, maka player sekarang adalah player 2
				await foundRoom.update({
					player_2_choices: playerChoices,
					player_2_uuid: req.user.player_id,
				});
			} else {
				return errorHandler(400, "Room Sudah Penuh", res);
			}
		}

		// Pengecekan apakah seluruh player sudah memilih
		if (foundRoom.player_1_choices && foundRoom.player_2_choices) {
			// User history
			const userOneHistory = await History.findOne({
				where: {
					user_uuid: foundRoom.player_1_uuid,
				},
			});

			const userTwoHistory = await History.findOne({
				where: {
					user_uuid: foundRoom.player_2_uuid,
				},
			});

			// Score awal player
			let player1Score = 0;
			let player2Score = 0;

			for (const index in foundRoom.player_1_choices) {
				const player1Choice = foundRoom.player_1_choices[index];
				const player2Choice = foundRoom.player_2_choices[index];

				const playersChoice = `${player1Choice}${player2Choice}`;

				// Jalannya pertandingan antara player 1 & player 2 dalam 3 ronder
				switch (playersChoice) {
					case "ROCKROCK":
						player1Score += 1;
						player2Score += 1;
						break;
					case "ROCKPAPER":
						player2Score += 1;
						break;
					case "ROCKSCISSOR":
						player1Score += 1;
						break;
					case "PAPERROCK":
						player1Score += 1;
						break;
					case "PAPERPAPER":
						player1Score += 1;
						player2Score += 1;
						break;
					case "PAPERSCISSOR":
						player2Score += 1;
						break;
					case "SCISSORROCK":
						player2Score += 1;
						break;
					case "SCISSORPAPER":
						player1Score += 1;
						break;
					case "SCISSORSCISSOR":
						player1Score += 1;
						player2Score += 1;
						break;
					default:
						break;
				}
			}

			// Check kondisi kemenangan berdasarkan score
			if (player1Score > player2Score) {
				// Update history player 1
				await userOneHistory.update({
					win: Number(userOneHistory.win) + 1,
				});

				// Update history player 2
				await userTwoHistory.update({
					lose: Number(userTwoHistory.lose) + 1,
				});

				// Update hasil pertandingan ke models room
				await foundRoom.update({
					winner_uuid: foundRoom.player_1_uuid,
					loser_uuid: foundRoom.player_2_uuid,
					draw: false,
				});

				res.status(200).json({
					message: "PLAYER 1 WIN",
				});
			} else if (player2Score > player1Score) {
				await userOneHistory.update({
					lose: Number(userOneHistory.lose) + 1,
				});

				await userTwoHistory.update({
					win: Number(userTwoHistory.win) + 1,
				});

				await foundRoom.update({
					winner_uuid: foundRoom.player_1_uuid,
					loser_uuid: foundRoom.player_2_uuid,
					draw: false,
				});

				res.status(200).json({
					message: "PLAYER 2 WIN",
				});
			} else {
				await userOneHistory.update({
					draw: Number(userOneHistory.draw) + 1,
				});

				await userTwoHistory.update({
					draw: Number(userTwoHistory.draw) + 1,
				});

				await foundRoom.update({
					draw: true,
				});

				res.status(200).json({
					message: "DRAW",
				});
			}
		} else {
			// Jika hanya baru satu player yg milih
			res.status(200).json({
				message: "Pilihan Anda Telah Disimpan, Menunggu Pilihan dari Player 2",
			});
		}
	} catch (error) {
		console.log("===============PLAY GAME ROOM=====================");
		console.log(error);
		console.log("===============PLAY GAME ROOM=====================");
		return errorHandler(500, error.message, res);
	}
};

module.exports = {
	Register,
	Login,
	CreateRoom,
	PlayGameRoom,
};
