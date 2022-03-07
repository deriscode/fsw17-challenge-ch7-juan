"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Biodata extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Biodata.belongsTo(models.User, {
				foreignKey: "user_uuid",
				as: "user",
			});
		}
	}
	Biodata.init(
		{
			uuid: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			age: {
				type: DataTypes.INTEGER(3),
			},
			address: {
				type: DataTypes.STRING(255),
			},
			city: {
				type: DataTypes.STRING(255),
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
			modelName: "Biodata",
			freezeTableName: true,
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		}
	);

	return Biodata;
};
