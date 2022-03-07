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
		}
	}
	Room.init(
		{
			room_name: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: {
					msg: "Nama Room Sudah Digunakan",
				},
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

	return Room;
};
