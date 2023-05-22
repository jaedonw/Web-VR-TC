import { Sequelize } from "sequelize";
import { config } from "../config.js";

export const sequelize = new Sequelize(
  config.dbName,
  config.dbUsername,
  config.dbPassword,
  {
    host: config.dbHost,
    dialect: config.dbDialect,
  }
);
