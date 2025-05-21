import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import Job from "./job.model";
import User from "./user.model";
import Application from "./application.model";
import Payment from "./payment.model";

@Table({
  timestamps: true,
})
class Contract extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "Pending Acceptance",
  })
  status!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  start_date!: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  deadline_date!: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  offered_amount!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  final_amount?: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  freelancer_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  employer_id!: number;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  job_id!: number;

  @BelongsTo(() => User, "freelancer_id")
  freelancer!: User;

  @BelongsTo(() => User, "employer_id")
  employer!: User;

  @BelongsTo(() => Job)
  job!: Job;

  @HasOne(() => Payment)
  payment?: Payment;
}

export default Contract;
