import * as fs from "fs";
import { join } from "path";
import prettier from "prettier";

const file = join(__dirname, "../types/resolvers-types.ts");
const data = fs.readFileSync(file, "utf8");

const unwantedCode = `export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };`;

const pattern = /InputMaybe<(.+?)>/g;
const pattern2 = /Maybe<(.+?)>/g;

const pattern3 = /export interface Query[\s\S]*?};\n\n/g;
const pattern4 = /export interface Mutation[\s\S]*?};\n\n/g;
const pattern5 = /export interface Subscription[\s\S]*?};\n\n/g;

const pattern6 = /export type (\w+)(?!Input|Type)(?=\s=\s\{)/g;

const regex = /export\s+interface\s+QueryType[\s\S]*?}/g;
const regex1 = /export\s+interface\s+MutationType[\s\S]*?}/g;
const regex2 = /export\s+interface\s+SubscriptionType[\s\S]*?}/g;

const transformedContent = data
  .replace(unwantedCode, "")
  .replace(pattern, "$1")
  .replace(pattern2, "$1")
  .replace(regex, "")
  .replace(regex1, "")
  .replace(regex2, "");

prettier
  .format(transformedContent, { parser: "typescript" })
  .then((prettiefied) => {
    fs.writeFileSync(file, prettiefied, "utf8");
  });
