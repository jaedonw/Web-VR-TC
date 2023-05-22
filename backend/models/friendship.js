import { sequelize } from "../datasource/datasource.js";
import { DataTypes } from "sequelize";

export const Friendship = sequelize.define("Friendship", {
  pending: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});
