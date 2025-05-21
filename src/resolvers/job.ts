import { Op } from "sequelize";
import Application from "../models/application.model";
import Contract from "../models/contract.model";
import Job from "../models/job.model";
import Skill from "../models/skill.model";
import User from "../models/user.model";
import {
  CreateJobInputType,
  JobType,
  UserType,
} from "../types/resolvers-types";
import { log } from "console";
import { application } from "express";

const JobResolvers = {
  Query: {
    Jobs: async (_: any, __: any, { user }: { user: UserType }) => {
      const result = await Job.findAll({
        where: {
          status: true,
          banned: false,
        },
        include: [Application, Contract, User, Skill],
      });
      const jobs = result.map((job) => {
        const hasApplied = job.applications.findIndex(
          (application) => application.freelancer_id === user.id
        );

        log;
        return {
          ...job.dataValues,
          hasApplied: hasApplied === -1 ? false : true,
        };
      });
      return jobs;
    },
    myJobs: async (_: any, __: any, { user }: { user: UserType }) => {
      const result = await Job.findAll({
        where: {
          employer_id: user.id,
          status: true,
        },
        include: [
          { model: Application, include: [User] },
          Contract,
          User,
          Skill,
        ],
      });
      return result;
    },
    frelancerJobFeed: async (_: any, __: any, { user }: { user: UserType }) => {
      // Fetch user's preferential profile
      const userPreferences = await User.findOne({
        where: { id: user.id, banned: false },
        include: [Skill],
      });

      const preferredSkillIds = userPreferences?.skills.flatMap(
        (s: any) => s.id
      );

      // Fetch jobs that match user's preferential job categories and skills
      const preferredJobs = await Job.findAll({
        where: {
          banned: false,

          // [Op.or]: [
          //   {
          //     "$Skills.id$": {
          //       [Op.in]: preferredSkillIds,
          //     },
          //   },
          // ],
          status: true,
        },
        include: [
          { model: Application, include: [User] },
          Contract,
          User,
          Skill,
        ],
      });

      // Fetch all other jobs that do not match user's preferences
      const otherJobs = await Job.findAll({
        where: {
          banned: false,

          //   "$Skills.id$": {
          //     [Op.notIn]: preferredSkillIds,
          //   },
        },
        include: [
          { model: Application, include: [User] },
          Contract,
          User,
          Skill,
        ],
      });

      // Combine and return the jobs with prioritized ones first
      const combinedJobs = [...preferredJobs, ...otherJobs];
      const jobs = combinedJobs.map((job) => {
        const hasApplied = job.applications.map((application) => {
          return application.freelancer_id === user.id;
        });
        return {
          ...job.dataValues,
          hasApplied: !(hasApplied.length === 0),
        };
      });
      return jobs;
    },
    appliedJobs: async (_: any, __: any, { user }: { user: UserType }) => {
      const applications = await Application.findAll({
        where: {
          freelancer_id: user.id,
        },
        include: [Job],
      });
      let jobs: JobType[] = [];
      applications.map((application) => {
        if (application?.Job) jobs.push(application.Job.dataValues);
        return;
      });
      return jobs;
    },
  },
  Mutation: {
    createJob: async (
      _: any,
      { input }: { input: CreateJobInputType },
      { user }: { user: UserType }
    ) => {
      const result = await Job.create({ ...input, employer_id: user.id });
      return result;
    },
    closeJob: async (
      _: any,
      { id }: { id: number },
      { user }: { user: UserType }
    ) => {
      const result = await Job.update(
        { status: false },
        {
          where: {
            id,
          },
        }
      );
      return result[0];
    },
    banJob: async (
      _: any,
      { job_id, ban }: { job_id: number; ban: boolean },
      ___: any
    ) => {
      const banned = await Job.update(
        {
          banned: ban,
        },
        {
          where: {
            id: job_id,
          },
        }
      );
      return true;
    },
  },
};
export default JobResolvers;
