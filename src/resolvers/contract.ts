import { withFilter } from "graphql-subscriptions";
import { Transaction } from "sequelize";
import Contract from "../models/contract.model";
import Job from "../models/job.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import UserBalance from "../models/user_balance.model";
import createChapaPayment, { generateTxRef } from "../services/services";
import { UserAccount } from "../types/auth-types";
import {
  AcceptContractInputType,
  CreateContractInputType,
  FinalizeContractInputType,
  JobProgressInputType,
  UserType,
} from "../types/resolvers-types";
import sequelize from "../utils/db.connection";

const contractResolvers = {
  Query: {
    contracts: async (_: any, __: any, ___: any) => {
      const result = await Contract.findAll({
        include: [Payment],
      });
      return result;
    },
    employerContracts: async (
      _: any,
      __: any,
      { user }: { user: UserType }
    ) => {
      const result = await Contract.findAll({
        where: {
          employer_id: user.id,
        },
        include: [
          { model: User, as: "employer" },
          { model: User, as: "freelancer" },
          Job,
          Payment,
        ],
      });
      return result;
    },
    freelancerContracts: async (
      _: any,
      __: any,
      { user }: { user: UserType }
    ) => {
      const result = await Contract.findAll({
        where: {
          freelancer_id: user.id,
        },
        include: [
          { model: User, as: "employer" },
          { model: User, as: "freelancer" },
          Job,
          Payment,
        ],
      });
      return result;
    },
  },
  Mutation: {
    createContract: async (
      _: any,
      { input }: { input: CreateContractInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await Contract.create({
        ...input,
        employer_id: user.id,
      });
      pubsub.publish("NEW_CONTRACT_REQUEST", { ...result.dataValues });

      return result;
    },
    finalizeContract: async (
      _: any,
      { input }: { input: FinalizeContractInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await Contract.update(
        {
          ...input,
        },
        {
          where: {
            id: input.id,
          },
        }
      ).then(async () => {
        return await Contract.findOne({
          where: { id: input.id },
        });
      });
      // if (result)
      //   pubsub.publish("NEW_CONTRACT_REQUEST", { ...result.dataValues });

      return result;
    },
    acceptContract: async (
      _: any,
      { input }: { input: AcceptContractInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const result = await Contract.update(
          {
            status: input.accepted ? "Pending Payment" : "Cancelled",
          },
          {
            where: {
              id: input.contract_id,
            },
            transaction: t,
          }
        ).then(async () => {
          return await Contract.findOne({
            where: { id: input.contract_id },
            include: [{ model: User, as: "freelancer" }],
          });
        });

        if (input.accepted && result) {
          const amount = result.final_amount
            ? result.final_amount
            : result.offered_amount;
          let txRef = generateTxRef(result.freelancer.id);
          // console.log({ txRef });
          const paymentInfo = {
            amount: `${amount}`,
            email: result.freelancer.email,
            first_name: result.freelancer.firstname,
            last_name: result.freelancer.lastname,
            phone_number: result.freelancer.phone,
            tx_ref: txRef,
            contract_id: result.id,
          };
          const userBalance = await UserBalance.findOne({
            where: {
              user_id: result.employer_id,
            },
          });
          if (!userBalance) {
            throw new Error(`User doesn't have account.`);
          }
          if (userBalance.balance < amount) {
            throw new Error(`Insufficient balance`);
          }
          const deducted = await UserBalance.update(
            { balance: userBalance.balance - amount },
            {
              where: {
                user_id: result.employer_id,
              },
              transaction: t,
            }
          );

          // console.log(paymentInfo);
          const paymentResult: any = await createChapaPayment(paymentInfo);
          // console.log({ paymentResult });
          if (paymentResult.status === "success") {
            const payment = await Payment.create(
              {
                amount: result.final_amount
                  ? result.final_amount
                  : result.offered_amount,
                contract_id: input.contract_id,
                freelancer_id: result.freelancer_id,
                employer_id: result.employer_id,
                tx_ref: txRef,
                checkout_url: paymentResult.data.checkout_url,
              },
              {
                transaction: t,
              }
            );
            //Todo:check the whole logic and change the subscription
            pubsub.publish("CONTRACT_ACCEPTED", {
              ...payment.dataValues,
            });
          }
        }
        await t.commit();

        return result;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    jobProgress: async (
      _: any,
      { input }: { input: JobProgressInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const result = await Contract.update(
          {
            status: input.status ? "Pending Release" : "Cancelled",
          },
          {
            where: {
              id: input.contract_id,
            },
            transaction: t,
          }
        ).then(async () => {
          return await Contract.findOne({
            where: { id: input.contract_id },
            transaction: t,
          });
        });
        // if (result)
        //   pubsub.publish("NEW_CONTRACT_REQUEST", {
        //     ...result.dataValues,
        //   });
        await t.commit();
        return result;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    approveJobReleaseFund: async (
      _: any,
      { input }: { input: JobProgressInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        //Todo:full logic isn't implemented
        const result = await Contract.update(
          {
            status: "Released",
          },
          {
            where: {
              id: input.contract_id,
            },
            transaction: t,
          }
        ).then(() => Contract.findByPk(input.contract_id));
        if (input.status && result) {
          const amount = result.final_amount
            ? result.final_amount
            : result.offered_amount;
          const fee = amount * 0.03;
          const remainingAmount = amount - fee;

          const userBalance = await UserBalance.update(
            {
              balance: sequelize.literal(`balance + ${remainingAmount}`),
            },
            {
              where: {
                user_id: result.freelancer_id,
              },
              transaction: t,
            }
          );
          const adminBalance = await UserBalance.update(
            {
              balance: sequelize.literal(`balance +  ${fee * 2}`),
            },
            {
              where: {
                id: 1,
              },
              transaction: t,
            }
          );
          if (userBalance[0]) {
            const payment = await Payment.update(
              {
                status: "Released",
              },
              {
                where: {
                  contract_id: result.id,
                  freelancer_id: result.freelancer_id,
                  employer_id: result.employer_id,
                },
                transaction: t,
              }
            );
          }
        }
        // if (result)
        //   pubsub.publish("NEW_CONTRACT_REQUEST", {
        //     ...result.dataValues,
        //   });
        await t.commit();
        return true;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        console.log(error);
        throw new Error(`${error}`);
      }
    },
  },
  Subscription: {
    contractRequested: {
      subscribe: withFilter(
        (
          _: any,
          __: any,
          { pubsub, user }: { pubsub: any; user: UserAccount }
        ) => pubsub.asyncIterator(["NEW_CONTRACT_REQUEST"]),

        (payload: any, variables: any, context: any) => {
          const userId = context.user.id;
          return payload.freelancer_id === userId;
        }
      ),
      resolve: (payload: any) => {
        // console.log(payload);
        return payload;
      },
    },
    contractAccepted: {
      subscribe: withFilter(
        (
          _: any,
          __: any,
          { pubsub, user }: { pubsub: any; user: UserAccount }
        ) => pubsub.asyncIterator(["CONTRACT_ACCEPTED"]),

        (payload: any, variables: any, context: any) => {
          const userId = context.user.id;
          return payload.employer_id === userId;
        }
      ),
      resolve: (payload: any) => {
        // console.log(payload);
        return payload;
      },
    },
    contractStarted: {
      subscribe: withFilter(
        (
          _: any,
          __: any,
          { pubsub, user }: { pubsub: any; user: UserAccount }
        ) => pubsub.asyncIterator(["CONTRACT_STARTED"]),

        (payload: any, variables: any, context: any) => {
          const userId = context.user.id;
          return payload.freelancer_id === userId;
        }
      ),
      resolve: (payload: any) => {
        // console.log(payload);
        return payload;
      },
    },
  },
};
export default contractResolvers;
