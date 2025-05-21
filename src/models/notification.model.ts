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

@Table({
  timestamps: true,
})
class Notification extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.TEXT,
  })
  message!: string;

  @Column({
    type: DataType.STRING,
  })
  type!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  seen!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  is_read!: boolean;

  @Column({
    type: DataType.JSON,
  })
  link!: object;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  recipient_id!: number;

  @BelongsTo(() => User)
  recipient!: User;
}

export default Notification;
