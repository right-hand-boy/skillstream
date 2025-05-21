import { withFilter } from "graphql-subscriptions";
import Message from "../models/message.model";
import { UserAccount } from "../types/auth-types";
import { MessageInputType, UserType } from "../types/resolvers-types";
import { Op } from "sequelize";
import User from "../models/user.model";

const messageResolvers = {
  Query: {
    messages: async (_: any, __: any, { user }: { user: UserType }) => {
      try {
        console.log({ user });
        const messages = await Message.findAll({
          where: {
            [Op.or]: [{ sender_id: user.id }, { receiver_id: user.id }],
          },
          include: [
            { model: User, as: "sender" },
            { model: User, as: "receiver" },
          ],
          order: [["createdAt", "ASC"]],
        });
        const groupedMessages: { [key: string]: any } = {};

        messages.forEach((message) => {
          const otherUserId =
            message.sender_id === user.id
              ? message.receiver_id
              : message.sender_id;
          const otherUser =
            message.sender_id === user.id ? message.receiver : message.sender;

          if (!groupedMessages[otherUserId]) {
            groupedMessages[otherUserId] = {
              participant: otherUser,
              messages: [],
            };
          }
          groupedMessages[otherUserId].messages.push(message);
        });

        return Object.values(groupedMessages);
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch messages");
      }
      // return result;
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      { input }: { input: MessageInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await Message.create({ ...input, sender_id: user.id });
      pubsub.publish("NEW_MESSAGE", { ...result.dataValues });
      return result;
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (
          _: any,
          __: any,
          { pubsub, user }: { pubsub: any; user: UserAccount }
        ) => pubsub.asyncIterator(["NEW_MESSAGE"]),

        (payload: any, variables: any, context: any) => {
          const userId = context.user.id;
          return payload.receiver_id === userId;
        }
      ),
      resolve: (payload: any) => {
        // console.log(payload);
        return payload;
      },
    },
  },
};
export default messageResolvers;
