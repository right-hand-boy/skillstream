import Skill from "../models/skill.model";
import { UserType } from "../types/resolvers-types";

const skillResolver = {
  Mutation: {
    createSkill: async (
      _: any,
      { name }: { name: string },
      { user, pubsub }: { pubsub: any; user: UserType }
    ) => {
      const result = await Skill.create({
        name,
      });
      return result;
    },
  },
};
export default skillResolver;
