import axios from "axios";
import { Secret } from "jsonwebtoken";
import { DepositMoneyInputType } from "../types/resolvers-types";
import { generateTxRef } from "../services/services";
import { UserBalance } from "../models/user_balance.model";
import sequelize from "../utils/db.connection";
const userBalanceResolver = {
  Query: {},
  Mutation: {
    depositMoney: async (
      _: any,
      { input }: { input: DepositMoneyInputType },
      ___: any
    ) => {
      const { user_id, callBackUrl, ...paymentInfo } = input;
      const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL as Secret;
      const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as Secret;
      try {
        let tx_ref = generateTxRef(user_id);
        // let tx_ref = nanoid();
        const response = await axios.post(
          `${CHAPA_BASE_URL}/transaction/initialize`,
          {
            ...input,
            amount: `${input.amount}`,
            tx_ref,
            currency: "ETB",
            return_url: callBackUrl,
            callback_url: `https://skillstream-ooy8.onrender.com/api/verify-deposit/${user_id}/${tx_ref}`,
          },
          {
            headers: {
              Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            },
          }
        );
        // console.log(response.data);
        return response.data.data.checkout_url;
      } catch (error) {
        // console.log(error);
        throw new Error(`${error}`);
      }
    },
    verifyDeposit: async (id: any, amount: number) => {
      const userBalance = await UserBalance.update(
        {
          balance: sequelize.literal(`balance + ${amount}`),
        },
        {
          where: {
            user_id: id,
          },
        }
      );
      // console.log({ id });
      return userBalance;
    },
  },
};
export default userBalanceResolver;
