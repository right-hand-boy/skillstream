import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  HasMany,
  BelongsToMany,
  HasOne,
} from "sequelize-typescript";
import Skill from "./skill.model";
import UserSkill from "./user_skill.model";
import Job from "./job.model";
import Feedback from "./feedback.model";
import UserBalance from "./user_balance.model";

@Table({
  tableName: "users",
  timestamps: true,
})
class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar?: string;

  @Column({
    allowNull: false,
  })
  firstname!: string;

  @Column({
    allowNull: false,
  })
  lastname!: string;

  @Column({ type: DataType.VIRTUAL })
  get fullname() {
    return `${this.getDataValue("firstname")} ${this.getDataValue("lastname")}`;
  }

  @Column({
    allowNull: false,
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gender?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio?: string;

  @Column({
    allowNull: true,
  })
  phone?: string;

  @Column({
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  portfolio_dir?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  role!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_verified!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  banned!: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  resetToken?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  resetTokenExpires?: Date;

  @BelongsToMany(() => Skill, () => UserSkill)
  skills!: Skill[];

  @HasMany(() => Job)
  jobs?: Job[];

  @HasMany(() => Feedback, 'to_id')
  feedbacks!: Feedback[];
  @HasOne(() => UserBalance)
  balance!: UserBalance;
}

export default User;
