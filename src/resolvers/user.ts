import bcrypt from "bcrypt";
import Job from "../models/job.model";
import Skill from "../models/skill.model";
import User from "../models/user.model";
import UserSkill from "../models/user_skill.model";
import {
  CreateUserInputType,
  EditProfileInputType,
  UpdateProfileInputType,
} from "../types/resolvers-types";
import sequelize from "../utils/db.connection";
import jwt from "jsonwebtoken";
import Feedback from "../models/feedback.model";
import Application from "../models/application.model";
import UserBalance from "../models/user_balance.model";
import Contract from "../models/contract.model";
import Payment from "../models/payment.model";
import { Op, Transaction } from "sequelize";
import Token from "../models/token.model";
import { sendVerificationEmail } from "../services/sendEmail";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: number }, ___: any) => {
      const result = await User.findOne({
        where: { id: id },
        include: [Skill, Job, UserBalance,Feedback],
      });
      return result;
    },
    users: async (_: any, __: any, ___: any) => {
      const result = await User.findAll({
        where: {},
        include: [Skill, Job, UserBalance, Feedback],
      });
      return result;
    },
    employers: async (_: any, __: any, ___: any) => {
      const result = await User.findAll({
        where: { role: "employer" },
        include: [
          Feedback,
          UserBalance,
          {
            model: Job,
            required: false,
            include: [{ model: Application, required: false }],
          },
        ],
      });
      return result;
    },
    // usersByDriverId: async (_: any, { id }: { id: number }, ___: any) => {
    //     const user = await User.findAll({});
    //     return user;
    // },
    dashboardStats: async (_: any, __: any, ___: any) => {
      const clientsCount = await User.count({ where: { role: "employer" } });
      const freelancersCount = await User.count({
        where: { role: "freelance" },
      });
      const freelancers = await User.findAll({
        where: { role: "freelance" },
      });
      console.log({ freelancersCount });
      const jobsCount = await Job.count();
      const contractsCount = await Contract.count();
      const applicationsCount = await Application.count();
      const transactionsCount = await Payment.count();
      const recentTransactions = await Payment.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "freelancer" },
          { model: User, as: "employer" },
        ],
      });
      const formattedTransactions = recentTransactions.map((transaction) => ({
        id: transaction.id,
        from:
          transaction.employer.firstname + " " + transaction.employer.lastname,
        to:
          transaction.freelancer.firstname +
          " " +
          transaction.freelancer.lastname,
        amount: transaction.amount,
        status: transaction.status,
      }));
      return {
        clientsCount,
        freelancersCount,
        jobsCount,
        contractsCount,
        applicationsCount,
        transactionsCount,
        recentTransactions: formattedTransactions,
        freelancers,
      };
      // return result;
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      { input }: { input: CreateUserInputType },
      ___: any
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      const emailFound = await User.findOne({
        where: {
          email: input.email,
        },
      });

      const usernameFound = await User.findOne({
        where: {
          username: input.username,
        },
      });

      if (emailFound) {
        throw new Error("Email is already taken!");
      }
      if (usernameFound) {
        throw new Error("Username is already taken!");
      }
      if (input.role !== "freelance" && input.role !== "employer") {
        throw new Error("Choose role from either 'freelance' of 'employer'");
      }
      try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(input.password, salt);
        const result = await User.create(
          { ...input, password },
          { transaction: t }
        );
        const userBalance = await UserBalance.create(
          {
            user_id: result.id,
            balance: 0,
          },
          { transaction: t }
        );
        const token = await Token.create(
          { userId: result.id },
          { transaction: t }
        );
        await sendVerificationEmail(result.email, token.token);

        await t.commit();
        return result;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    updateProfile: async (
      _: any,
      { input }: { input: UpdateProfileInputType },
      ___: any
    ) => {
      const { skills, ...user } = input;
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const user = await User.update(
          { ...input },
          {
            where: {
              id: input.id,
            },
          }
        ).then(async () => {
          return await User.findOne({
            where: {
              id: input.id,
            },
          });
        });
        if (skills.length !== 0 && user?.id) {
          const userSkills = skills.map((skill) => {
            return {
              user_id: user.id,
              skill_id: skill,
            };
          });
          const skill = await UserSkill.bulkCreate(userSkills, {
            transaction: t,
          });
        }
        await t.commit();
        return true;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    editProfile: async (
      _: any,
      { input }: { input: EditProfileInputType },
      ___: any
    ) => {
      const { skills, ...user } = input;
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const user = await User.update(
          { ...input },
          {
            where: {
              id: input.id,
            },
          }
        ).then(async () => {
          return await User.findOne({
            where: {
              id: input.id,
            },
          });
        });
        if (!user) {
          throw new Error(`User not found `);
        }
        await UserSkill.destroy({
          where: {
            user_id: user.id,
          },
        });
        if (skills.length !== 0 && user?.id) {
          const userSkills = skills.map((skill) => {
            return {
              user_id: user.id,
              skill_id: skill,
            };
          });
          const skill = await UserSkill.bulkCreate(userSkills, {
            transaction: t,
          });
        }

        await t.commit();
        return true;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    loginUser: async (
      _: any,
      { input }: { input: CreateUserInputType },
      ___: any
    ) => {
      const userInfo = await User.findOne({
        where: { email: input.email },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      if (!userInfo) {
        throw new Error(`Invalid Email or Password 1`);
      }
      if (userInfo.banned) {
        throw new Error(`Your Account has been banned.`);
      }
      if (!userInfo.is_verified) {
        throw new Error(`Verify Your Email first`);
      }
      const { password, ...user } = userInfo.dataValues;
      const correctPassword = await bcrypt.compare(input.password, password);
      if (!correctPassword) {
        throw new Error(`Invalid Email or Password 2`);
      }
      // const user = dataValues;
      const token = jwt.sign({ user }, process.env.JWT_SECRET!);
      return { token, user };
    },
    banUser: async (
      _: any,
      { user_id, ban }: { user_id: number; ban: boolean },
      ___: any
    ) => {
      const banned = await User.update(
        {
          banned: ban,
        },
        {
          where: {
            id: user_id,
          },
        }
      );
      return true;
    },
    deleteUser: async (_: any, { user_id }: { user_id: number }, ___: any) => {
      const result = await User.destroy({
        where: {
          id: user_id,
        },
      });
      return true;
    },
    requestResetPassword: async (_: any, { email }: { email: string }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("User not found");
      }

      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpires;
      await user.save();

      const transporter = nodemailer.createTransport({
        // host: "sandbox.smtp.mailtrap.io",
        // port: 2525,
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.APP_EMAIL_PASS,
        },
      });
      console.log({ email });
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password Reset",
        text: `To reset your password, use this token: ${resetToken}`,
      };

      await transporter.sendMail(mailOptions);

      return "Password reset token sent to email";
    },
    resetPassword: async (
      _: any,
      {
        email,
        resetToken,
        newPassword,
      }: { email: string; resetToken: string; newPassword: string }
    ) => {
      const user = await User.findOne({
        where: {
          email,
          resetToken,
          resetTokenExpires: { [Op.gt]: new Date() },
        },
      });
      if (!user) {
        throw new Error("Invalid or expired reset token");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.update(
        {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
        {
          where: {
            id: user.id,
          },
        }
      );
      // await user.save();

      return "Password has been reset successfully";
    },
  },
};
export default userResolvers;
