"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Room extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// Hubungan antara model User & Room
			// Menyatakan siapa user pembuat room
			Room.belongsTo(models.User, {
				foreignKey: "owned_by",
				as: "owner",
			});

			// Mendefinisikan player 1 di room tersebut
			Room.belongsTo(models.User, {
				foreignKey: "player_1_uuid",
				as: "player_1",
			});

			// Mendefinisikan player 2 di room tersebut
			Room.belongsTo(models.User, {
				foreignKey: "player_2_uuid",
				as: "player_2",
			});

			// Mendefinisikan pemenang di room
			Room.belongsTo(models.User, {
				foreignKey: "winner_uuid",
				as: "winner",
			});

			// Mendefinisikan yg kalah di room
			Room.belongsTo(models.User, {
				foreignKey: "loser_uuid",
				as: "loser",
			});
		}
	}
	Room.init(
		{
			uuid: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			room_name: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: {
					msg: "Nama Room Sudah Digunakan",
				},
			},
			owned_by: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			player_1_choices: {
				type: DataTypes.ARRAY(DataTypes.ENUM("ROCK", "PAPER", "SCISSOR")),
			},
			player_1_uuid: {
				type: DataTypes.UUID,
			},
			player_2_choices: {
				type: DataTypes.ARRAY(DataTypes.ENUM("ROCK", "PAPER", "SCISSOR")),
			},
			player_2_uuid: {
				type: DataTypes.UUID,
			},
			winner_uuid: {
				type: DataTypes.UUID,
			},
			loser_uuid: {
				type: DataTypes.UUID,
			},
			draw: {
				type: DataTypes.BOOLEAN,
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
			modelName: "Room",
			freezeTableName: true,
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		}
	);

	// Hooks
	Room.beforeCreate((room) => {
		room.room_name = room.room_name.toLowerCase();
	});

	Room.beforeUpdate((room) => {
		room.room_name = room.room_name.toLowerCase();
	});

	return Room;
};
