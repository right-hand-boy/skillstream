import { faker } from "@faker-js/faker";
import sequelize from "../db.connection";
import { Transaction } from "sequelize";
import Skill from "../../models/skill.model";
import { admin, adminBalance, skills } from "./datas";
import User from "../../models/user.model";
import UserBalance from "../../models/user_balance.model";

sequelize;
async function seeds() {
  let t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  });
  try {
    console.log("Seeding admin...");
    await User.create(admin, { transaction: t });

    console.log("Seeding admin balance...");
    await UserBalance.create(adminBalance, { transaction: t });

    console.log("Seeding skills...");
    await Skill.bulkCreate(skills, { transaction: t });

    console.log("Done...");

    await t.commit();
  } catch (error) {
    console.log(`Error in seeders/index ${error}`);
    if (t) {
      await t.rollback();
    }
    throw new Error(`An error occurred in seeders/index. ${error}`);
  }
}
seeds();
