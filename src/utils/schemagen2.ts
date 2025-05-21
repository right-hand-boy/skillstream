import { readdirSync, writeFileSync } from "fs";
import path from "path";
import sequelize from "./db.connection";
import { ModelCtor } from "sequelize-typescript";
import { AbstractDataType } from "sequelize";

sequelize;
function generateGraphQLType(model: ModelCtor): string {
  let typeDef = `type ${model.name} {\n`;

  for (const attribute in model.getAttributes()) {
    const attrType = (model.getAttributes()[attribute].type as AbstractDataType)
      .key;
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
      case "VIRTUAL":
        graphQLType = "String";
        break;
      case "INTEGER":
      case "BIGINT":
      case "SMALLINT":
        graphQLType = "Int";
        break;
      case "FLOAT":
      case "DOUBLE":
      case "DOUBLE PRECISION":
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

    if (
      association.associationType === "HasOne" ||
      association.associationType === "BelongsTo"
    ) {
      const isAssosiationAllowNull =
        model.getAttributes()[association.foreignKey]?.allowNull;

      typeDef += `  ${association.as}: ${targetType} ${
        association.associationType === "HasOne"
          ? ""
          : isAssosiationAllowNull
            ? ""
            : "!"
      } \n`;
    } else {
      typeDef += `  ${association.as}: [${targetType}!]!\n`;
    }
  }

  typeDef += "}";

  return typeDef;
}

// Generate GraphQL type and write to file

const modelPath = path.join(__dirname, "../models");

const dirs = readdirSync(modelPath);

let baseSchema = `
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

dirs.forEach((file) => {
  const model = require(path.join(modelPath, file));

  const typeDef = generateGraphQLType(model.default);

  baseSchema += `\n${typeDef}\n`;
});

const schemaPath = path.join(__dirname, `../generated/schema.graphql`);
writeFileSync(schemaPath, baseSchema);
