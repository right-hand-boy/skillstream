import {
    Table,
    Column,
    Model,
    PrimaryKey,
    DataType,
    HasMany,
    ForeignKey,
    BelongsToMany,
    BelongsTo,
} from "sequelize-typescript";
import User from "./user.model";
import Skill from "./skill.model";

@Table({
    timestamps: true,
})
class UserSkill extends Model {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
    })
    id!: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    user_id!: number;

    @ForeignKey(() => Skill)
    @Column({ type: DataType.INTEGER, allowNull: false })
    skill_id!: number;

    @BelongsTo(() => Skill)
    skill!: Skill;

    @BelongsTo(() => User)
    user!: User;
}

export default UserSkill;
