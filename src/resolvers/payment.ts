import { Transaction } from "sequelize";
import Contract from "../models/contract.model";
import Payment from "../models/payment.model";
import UserBalance from "../models/user_balance.model";
import createChapaPayment, { checkPaymentStatus } from "../services/services";
import {
  ConfirmPaymentInputType,
  CreatePaymentInputType,
  UserType,
} from "../types/resolvers-types";
import sequelize from "../utils/db.connection";

const paymentResolvers = {
  Mutation: {
    createPayment: async (
      _: any,
      { input }: { input: CreatePaymentInputType },
      { user }: { user: UserType }
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const payment = await Payment.create({
          ...input,
          employer_id: user.id,
        });
        const chapaPayment = await createChapaPayment(20);
        console.log({ chapaPayment });
        // const adminTransaction = await AdminTransaction.create({

        // })
        await t.commit();
        return payment;
      } catch (error) {
        console.log(`Error: company_vehicle_dispatch. ${error}`);
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
    confirmPayment: async (
      _: any,
      { input }: { input: ConfirmPaymentInputType },
      ___: any
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const payment = await Payment.update(
          {
            status: "Funded",
          },
          {
            where: {
              id: input.payment_id,
            },
          }
        ).then(async () => await Payment.findByPk(input.payment_id));
        const contract = await Contract.update(
          { status: "Funded" },
          { where: { id: payment?.contract_id } }
        ).then(
          async () =>
            await Contract.findOne({
              where: {
                id: payment?.contract_id,
              },
            })
        );
        if (!payment) {
          throw new Error(`Payment not found`);
        }
        if (!contract) {
          throw new Error(`contract not found`);
        }
        const freelancerBalance = await UserBalance.update(
          {
            balance: sequelize.literal(
              `balance - ${payment.amount + payment.amount * 0.03}`
            ),
          },
          {
            where: { user_id: payment?.employer_id },

            transaction: t,
          }
        );
        // console.log(freelancerBalance);
        const status = await checkPaymentStatus(payment.tx_ref);
        // pubsub.publish("CONTRACT_STARTED", { ...contract.dataValues });
        // console.log(status.data.data.status);
        if (status.data.data.status === "success") await t.commit();
        else await t.rollback();
        return status.data.data.status;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
  },
};

export default paymentResolvers;
