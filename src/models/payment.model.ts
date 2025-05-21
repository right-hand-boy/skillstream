import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import Contract from "./contract.model";

@Table({
  timestamps: true,
})
class Payment extends Model {
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
  amount!: number;

  @ForeignKey(() => Contract)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  contract_id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  freelancer_id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  employer_id!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: "Pending",
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tx_ref!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  checkout_url!: string;

  @BelongsTo(() => Contract)
  contract!: Contract;

  @BelongsTo(() => User, "freelancer_id")
  freelancer!: User;

  @BelongsTo(() => User, "employer_id")
  employer!: User;
}
export default Payment;
