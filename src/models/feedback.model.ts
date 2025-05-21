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
class Feedback extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  rating!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  seen!: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  from_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  to_id!: number;

  @BelongsTo(() => User, "from_id")
  from!: User;

  @BelongsTo(() => User, "to_id")
  to!: User;
}

export default Feedback;
