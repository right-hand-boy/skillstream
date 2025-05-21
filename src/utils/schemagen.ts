import { readdirSync, writeFileSync } from "fs";
import path from "path";
import sequelize from "./db.connection";

sequelize;
function generateGraphQLType(model: any): string {
  let toBeImported = `#import './base.schema.graphql'\n`;
  let typeDef = `type ${model.name} {\n`;

  for (const attribute in model.getAttributes()) {
    const attrType = model.getAttributes()[attribute].type.constructor.key;
    const allowNull = !!model.getAttributes()[attribute].allowNull;
    const attr = model.getAttributes()[attribute];

    let graphQLType;

    switch (attrType) {
      case "UUID":
        graphQLType = "ID";
        break;
      case "UUID":
      case "STRING":
      case "CHAR":
      case "TEXT":
        graphQLType = "String";
        break;
      case "INTEGER":
      case "BIGINT":
      case "SMALLINT":
        graphQLType = "Int";
        break;
      case "FLOAT":
      case "DOUBLE":
      case "DECIMAL":
        graphQLType = "Float";
        break;
      case "BOOLEAN":
        graphQLType = "Boolean";
        break;
      case "DATE":
      case "DATEONLY":
        graphQLType = "Date";
        break;
      case "TIME":
        graphQLType = "Time";
        break;
      case "DATETIME":
      case "NOW":
        graphQLType = "DateTime";
        break;
      case "JSON":
      case "JSONB":
        graphQLType = "JSON";
        break;
      default:
        throw new Error(`Unsupported Sequelize data type: ${attrType}`);
    }

    if (!attr.references)
      typeDef += `  ${attribute}: ${graphQLType}${allowNull ? "" : "!"}\n`;
  }

  const associations = model.associations;

  for (let key in associations) {
    const association = associations[key];

    const targetType = association.target.name;

    toBeImported += `#import './${targetType.toLowerCase()}.schema.graphql'\n`;

    if (
      association.associationType === "HasOne" ||
      association.associationType === "BelongsTo"
    ) {
      typeDef += `  ${association.as}: ${targetType}!\n`;
    } else {
      typeDef += `  ${association.as}: [${targetType}!]!\n`;
    }
  }

  typeDef += "}";

  return toBeImported + "\n" + typeDef;
}

// Generate GraphQL type and write to file

const modelPath = path.join(__dirname, "../models");

const dirs = readdirSync(modelPath);

const baseSchema = `#graphql 
    scalar Date
    scalar JSON

    type Query {
        _ : Boolean
    }

    type Mutation {
        _ : Boolean
    }

    type Subscription {
        _ : Boolean
    }

`;

const basePath = path.join(__dirname, `../schema/base.schema.graphql`);
writeFileSync(basePath, baseSchema);

dirs.forEach((file) => {
  const model = require(path.join(modelPath, file));

  const mypath = path.join(
    __dirname,
    `../schema/${model.default.name.toLowerCase()}.schema.graphql`
  );
  const typeDef = generateGraphQLType(model.default);

  writeFileSync(mypath, typeDef);
});
