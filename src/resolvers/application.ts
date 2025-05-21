import Application from "../models/application.model";
import { ApplyingInputType, UserType } from "../types/resolvers-types";
import { Transaction } from "sequelize";
import sequelize from "../utils/db.connection";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import Job from "../models/job.model";
import { withFilter } from "graphql-subscriptions";
import { UserAccount } from "../types/auth-types";

const applicationResolvers = {
  Query: {
    application: async (_: any, { id }: { id: number }, ___: any) => {
      const result = await Application.findOne({
        where: { id: id },
        include: [User, Job],
      });
      return result;
    },
    applications: async (_: any, __: any, ___: any) => {
      //   console.log(___);
      const result = await Application.findAll({
        include: [User, Job],
      });
      return result;
    },
  },
  Mutation: {
    applyForJob: async (
      _: any,
      { input }: { input: ApplyingInputType },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      let t: Transaction = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      });
      try {
        const { employer_id, ...application } = input;
        const result = await Application.create(
          {
            ...application,
            freelancer_id: user.id,
          },
          {
            transaction: t,
          }
        );
        const notification = await Notification.create({
          message: `${
            user.firstname + " " + user.lastname
          } applied to the job you posted!`,
          type: "Job Application",
          link: `job_id:${application.job_id}, application_id:${result.id}`,
          recipient_id: employer_id,
        });
        await t.commit();
        pubsub.publish("JOB_APPLIED", { ...notification.dataValues });
        return result;
      } catch (error) {
        if (t) {
          await t.rollback();
        }
        throw new Error(`${error}`);
      }
    },
  },
  Subscription: {
    newApplication: {
      subscribe: withFilter(
        (
          _: any,
          __: any,
          { pubsub, user }: { pubsub: any; user: UserAccount }
        ) => {
          return pubsub.asyncIterator(["JOB_APPLIED"]);
        },
        (payload: any, variables: any, context: any) => {
          const userId = context.user.id;
          // console.log("Payload:", payload);
          // console.log("User ID:", userId);
          return payload.recipient_id === userId;
        }
      ),
      resolve: (payload: any) => {
        // console.log(payload);
        return payload;
      },
    },
  },
};
export default applicationResolvers;
