import path from "path";
import { Sequelize } from "sequelize-typescript";

import config from "config";
import { DatabaseConfig } from "../types/database-types";

const { host, name, user, password, port }: DatabaseConfig = config.get("db");

// "host.docker.internal";
const sequelize = new Sequelize({
  database: "railway",
  username: "root",
  password: "dGXZTQOdVVDiHTzfkCodpNtJVvzftrXI",
  host: "crossover.proxy.rlwy.net",
  port: 36719,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 10000000,
  },
  models: [path.join(__dirname, "../models/**/*.model.*")],

  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("📂  Database Connected!\n");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

export default sequelize;
