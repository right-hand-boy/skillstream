// src/models/Token.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  Default,
  BelongsTo,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import User from "./user.model";

@Table
export default class Token extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4(),
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 3600000), // 1 hour expiry
  })
  expiryDate!: Date;

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;
}
