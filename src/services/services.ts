import axios from "axios";
import { Secret } from "jsonwebtoken";
import crypto from "crypto";
const createChapaPayment = async (paymentInfo: any) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL as Secret;
  const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as Secret;
  try {
    console.log({ paymentInfo });
    const response = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      {
        ...paymentInfo,
        currency: "ETB",
        // return_url: `http://192.168.93.13:3000/payment-success/${paymentInfo.tx_ref}`,
        // callback_url: `http://192.168.93.13:4000/api/verify-payment/${paymentInfo.contract_id}`,
        return_url: `https://skillstream-959dd.web.app/payment-success/${paymentInfo.tx_ref}`,
        callback_url: `https://skillstream-63xr.onrender.com/api/verify-payment/${paymentInfo.contract_id}`,
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating Chapa payment:", error);
    throw error;
  }
};
export const checkPaymentStatus = async (tx_id: string) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL as Secret;
  const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as Secret;
  const response = await axios.get(
    `${CHAPA_BASE_URL}/transaction/verify/${tx_id}`,
    {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    }
  );
  // console.log(response.data);
  return response;
};
export default createChapaPayment;
export function generateTxRef(userId: number): string {
  // Get the current timestamp
  const timestamp = new Date().toISOString();

  // Generate a random string
  const randomString = crypto.randomBytes(4).toString("hex");

  // Combine user ID, timestamp, and random string to create a unique tx_ref
  const txRef = `chapa_${userId}_${timestamp}_${randomString}`;

  return txRef.replace(/[:.-]/g, ""); // Remove special characters to make it URL safe
}
