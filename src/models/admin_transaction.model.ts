import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Contract from "./contract.model"; // Adjust the import path as needed
import User from "./user.model"; // Adjust the import path as needed

@Table({
  timestamps: true,
})
class AdminTransaction extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

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
  payer_id!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string;

  @BelongsTo(() => Contract)
  contract!: Contract;

  @BelongsTo(() => User, { foreignKey: "payer_id" })
  payer!: User;
}

export default AdminTransaction;
