import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import UserSkill from "./user_skill.model";
import Job from "./job.model";

@Table({
  timestamps: true,
})
export class Skill extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @BelongsToMany(() => User, () => UserSkill)
  users!: User[];

  @HasMany(() => Job)
  jobs!: Job[];
}

export default Skill;
