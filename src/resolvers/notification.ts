import Notification from "../models/notification.model";
import { UserType } from "../types/resolvers-types";

const notificationResolvers = {
  Query: {
    notifications: async (_: any, __: any, { user }: { user: UserType }) => {
      const result = await Notification.findAll({
        where: {
          recipient_id: user.id,
        },
        order: [["createdAt", "DESC"]],
      });
      return result;
    },
  },
};
export default notificationResolvers;
