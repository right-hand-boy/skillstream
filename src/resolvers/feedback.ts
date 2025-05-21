import { withFilter } from "graphql-subscriptions";
import Feedback from "../models/feedback.model";
import { UserAccount } from "../types/auth-types";
import {
  CreateAdminFeedbackInputType,
  CreateFeedbackInputType,
  UserType,
} from "../types/resolvers-types";
import User from "../models/user.model";
import AdminFeedback from "../models/admin_feedbacks.model";

const feedbackResolvers = {
  Query: {
    myFeedbacks: async (_: any, __: any, { user }: { user: UserType }) => {
      const result = await Feedback.findAll({
        where: {
          to_id: user.id,
        },
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "from" },
          { model: User, as: "to" },
        ],
      });
      return result;
    },
    adminFeedbacks: async (_: any, __: any, { user }: { user: UserType }) => {
      const result = await AdminFeedback.findAll({
        order: [["createdAt", "DESC"]],
      });
      return result;
    },

    feedbacksByUserId: async (
      _: any,
      { id }: { id: number },
      { user }: { user: UserType }
    ) => {
      const result = await Feedback.findAll({
        where: {
          to_id: id,
        },
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "from" },
          { model: User, as: "to" },
        ],
      });
      return result;
    },
  },
  Mutation: {
    createFeedback: async (
      _: any,
      { input }: { input: CreateFeedbackInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await Feedback.create({
        ...input,
        from_id: user.id,
      });
      return result;
    },
    createAdminFeedback: async (
      _: any,
      { input }: { input: CreateAdminFeedbackInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await AdminFeedback.create({
        ...input,
      });
      return result;
    },
  },
  //   Subscription: {
  //     newFeedback: {
  //       subscribe: withFilter(
  //         (
  //           _: any,
  //           __: any,
  //           { pubsub, user }: { pubsub: any; user: UserAccount }
  //         ) => pubsub.asyncIterator(["NEW_FEEDBACK"]),

  //         (payload: any, variables: any, context: any) => {
  //           const userId = context.user.id;
  //           console.log(payload);
  //           return payload.employer_id === userId;
  //         }
  //       ),
  //       resolve: (payload: any) => {
  //         // console.log(payload);
  //         return payload;
  //       },
  //     },
  //   },
};
export default feedbackResolvers;
