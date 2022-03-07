"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class History extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			History.belongsTo(models.User, {
				foreignKey: "user_uuid",
				as: "user",
			});
		}
	}
	History.init(
		{
			uuid: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			win: {
				type: DataTypes.INTEGER(32),
				defaultValue: 0,
			},
			lose: {
				type: DataTypes.INTEGER(32),
				defaultValue: 0,
			},
			draw: {
				type: DataTypes.INTEGER(32),
				defaultValue: 0,
			},
			user_uuid: {
				type: DataTypes.UUID,
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
			modelName: "History",
			freezeTableName: true,
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		}
	);

	return History;
};
