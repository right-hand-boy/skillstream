import path from "path";
import { Sequelize } from "sequelize-typescript";

// "host.docker.internal";
const sequelize = new Sequelize({
  database: "railway",
  username: "root",
  password: "HShaOfVHACzQBLUuELDJFYZsjJNfVyUO",
  host: "turntable.proxy.rlwy.net",
  port: 40059,
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
