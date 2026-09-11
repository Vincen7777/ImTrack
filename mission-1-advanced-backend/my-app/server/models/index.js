import { DataTypes } from 'sequelize';

export function defineModels(sequelize) {
  const id = () => ({ type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true });
  const fk = (allowNull = false) => ({ type: DataTypes.BIGINT.UNSIGNED, allowNull });
  const options = (tableName, updated = true) => ({ tableName, timestamps: true, createdAt: 'created_at', updatedAt: updated ? 'updated_at' : false });
  const User = sequelize.define('User', {
    user_id: id(),
    fullname: { type: DataTypes.STRING(100), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    avatar_url: DataTypes.STRING(500),
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    verification_token: { type: DataTypes.STRING(64), unique: true },
    verification_expires_at: DataTypes.DATE,
    email_verified_at: DataTypes.DATE,
  }, options('users'));
  const Recurrence = sequelize.define('Recurrence', {
    recurrence_id: id(),
    recurrence_type: { type: DataTypes.ENUM('daily', 'weekly', 'monthly'), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
  }, options('recurrences', false));
  const Task = sequelize.define('Task', {
    task_id: id(), user_id: fk(), recurrence_id: fk(true),
    title: { type: DataTypes.STRING(300), allowNull: false },
    priority: { type: DataTypes.ENUM('Sekarang', 'Nanti', 'Someday'), allowNull: false, defaultValue: 'Nanti' },
    status: { type: DataTypes.ENUM('todo', 'done'), allowNull: false, defaultValue: 'todo' },
    due_date: DataTypes.DATEONLY, category: DataTypes.STRING(100),
    is_recurring: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    deleted_at: DataTypes.DATE,
  }, { ...options('tasks'), indexes: [{ fields: ['user_id', 'status'] }, { fields: ['user_id', 'priority'] }] });
  const Tag = sequelize.define('Tag', {
    tag_id: id(), user_id: fk(), name: { type: DataTypes.STRING(50), allowNull: false },
  }, { ...options('tags', false), indexes: [{ unique: true, fields: ['user_id', 'name'] }] });
  const TaskTag = sequelize.define('TaskTag', {
    task_tag_id: id(), task_id: fk(), tag_id: fk(),
  }, options('task_tags', false));
  User.hasMany(Task, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Task.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(Tag, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Tag.belongsTo(User, { foreignKey: 'user_id' });
  Task.belongsTo(Recurrence, { foreignKey: 'recurrence_id', as: 'recurrence', onDelete: 'SET NULL' });
  Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'task_id', otherKey: 'tag_id', as: 'tags' });
  Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tag_id', otherKey: 'task_id' });
  return { User, Task, Tag, TaskTag, Recurrence };
}
