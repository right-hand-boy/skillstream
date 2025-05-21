import Skill from "../models/skill.model";

const lookupResolvers = {
  Query: {
    skills: async (_: any, __: any, ___: any) => {
      const result = await Skill.findAll();
      return result;
    },
  },
};

export default lookupResolvers;
