import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema, mergeSchemas } from "@graphql-tools/schema";
import { merge } from "lodash";
import path from "path";

import { addMocksToSchema } from "@graphql-tools/mock";
import { GraphQLScalarType, Kind } from "graphql";
import userResolvers from "./user";
import JobResolvers from "./job";
import lookupResolvers from "./lookup";
import applicationResolvers from "./application";
import notificationResolvers from "./notification";
import messageResolvers from "./message";
import contractResolvers from "./contract";
import feedbackResolvers from "./feedback";
import paymentResolvers from "./payment";
import userBalanceResolver from "./userBalance";
import skillResolver from "./skill";

const dateScalar = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value: any) {
      const dateValue = new Date(value);

      if (dateValue instanceof Date) {
        return dateValue.toISOString();
      }
      throw Error("GraphQL Date Scalar serializer expected a `Date` object");
    },
    parseValue(value) {
      if (typeof value === "string") {
        return new Date(value);
      }
      throw new Error("GraphQL Date Scalar parser expected a `number`");
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10));
      }
      return null;
    },
  }),
};

const allOperationPath = path.join(__dirname, "../schema/**/*.graphql");
const allSchemaPath = path.join(__dirname, "../generated/schema.graphql");

const allOperation = loadSchemaSync(allOperationPath, {
  loaders: [new GraphQLFileLoader()],
});

const allSchema = loadSchemaSync(allSchemaPath, {
  loaders: [new GraphQLFileLoader()],
});

export const mergedSchema = mergeSchemas({
  schemas: [allOperation, allSchema],
});

const mockedSchema = addMocksToSchema({
  schema: mergedSchema,
  mocks: {
    Date: () => new Date(),
  },
  preserveResolvers: true,
});

const gatewaySchema = addResolversToSchema({
  schema: mergedSchema,
  resolvers: merge(
    dateScalar,
    userResolvers,
    JobResolvers,
    lookupResolvers,
    applicationResolvers,
    notificationResolvers,
    messageResolvers,
    contractResolvers,
    feedbackResolvers,
    paymentResolvers,
    userBalanceResolver,
    skillResolver
  ),
});

export default gatewaySchema;
