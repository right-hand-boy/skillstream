import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import Application from "./application.model";
import Contract from "./contract.model";
import Skill from "./skill.model";

@Table({
  timestamps: true,
})
class Job extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  // @ForeignKey(() => User)
  // @Column({ type: DataType.INTEGER, allowNull: false })
  // freelancer_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  employer_id!: number;

  @Column({
    type: DataType.STRING,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
  })
  description!: string;

  @ForeignKey(() => Skill)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  skill_id?: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  posted_date!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  status!: boolean;

  @BelongsTo(() => User)
  employer!: User;

  @BelongsTo(() => Skill)
  skill?: Skill;

  @HasMany(() => Application)
  applications!: Application[];

  @HasMany(() => Contract)
  contracts?: Contract[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  banned!: boolean;
}

export default Job;
