import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import Job from "./job.model";
import User from "./user.model";

@Table({
  timestamps: true,
})
class Application extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price_offer!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  freelancer_id!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  about_freelancer!: string;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  job_id!: number;

  @BelongsTo(() => User)
  freelancer!: User;

  @BelongsTo(() => Job)
  Job!: Job;
}

export default Application;
