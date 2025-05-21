import config from "config";
import path from "path";
import { Sequelize } from "sequelize-typescript";
import { DatabaseConfig } from "../types/database-types";

const { host, name, user, password, port }: DatabaseConfig = config.get("db");

const sequelize = new Sequelize({
  database: name,
  username: user,
  password: password,
  host: host,
  port: port,
  dialectOptions: {
    connectTimeout: 100000,
  },
  dialect: "mysql",
  models: [path.join(__dirname, "../models/**/*.model.*")],
  //logging: console.log,
  logging: true,

});

sequelize
  .authenticate()
  .then(() => {
    console.log("📂  DB Connected.\n");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

sequelize
  .sync({  alter: true })
  .then(() => {
    console.log("Model Synchronized!");
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });

export default sequelize;
