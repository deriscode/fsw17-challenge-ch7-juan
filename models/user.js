"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			User.hasOne(models.Biodata, {
				foreignKey: "user_uuid",
				as: "biodata",
			});

			User.hasOne(models.History, {
				foreignKey: "user_uuid",
				as: "history",
			});

			// Hubungan antara model User & Room
			User.hasMany(models.Room, {
				foreignKey: "owned_by",
				as: "room",
			});

			User.hasMany(models.Room, {
				foreignKey: "player_1_uuid",
				as: "room_player_1_uuid",
			});

			User.hasMany(models.Room, {
				foreignKey: "player_2_uuid",
				as: "room_player_2_uuid",
			});

			User.hasMany(models.Room, {
				foreignKey: "winner_uuid",
				as: "room_winner",
			});

			User.hasMany(models.Room, {
				foreignKey: "loser_uuid",
				as: "room_loser",
			});
		}
	}
	User.init(
		{
			uuid: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			username: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: {
					msg: "Username Sudah Digunakan",
				},
			},
			email: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: {
					msg: "Email Sudah Digunakan",
				},
			},
			role: {
				type: DataTypes.ENUM("ADMIN", "PLAYER"),
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
			},
			updatedAt: {
				type: DataTypes.DATE,
			},
		},
		{
			sequelize,
			modelName: "User",
			freezeTableName: true,
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		}
	);

	// Hooks
	// Enkripsi password sebelum akun dibuat
	User.beforeCreate((user) => {
		user.password = user.password !== "" ? bcrypt.hashSync(user.password, 10) : "";
	});

	// Mengubah username & email menjadi huruf kecil semua sebelum dibuat & di-update
	User.beforeCreate((user) => {
		user.username = user.username.toLowerCase();
	});

	User.beforeCreate((user) => {
		user.email = user.email.toLowerCase();
	});

	User.beforeUpdate((user) => {
		user.username = user.username.toLowerCase();
	});

	User.beforeUpdate((user) => {
		user.email = user.email.toLowerCase();
	});

	return User;
};
