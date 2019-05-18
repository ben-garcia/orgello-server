module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      username: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
          min: 6,
          max: 30,
        },
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
          min: 6,
          max: 30,
        },
      },
    },
    {},
  );
  user.associate = (models) => {
    // user is the source
    // board is the target
    user.hasMany(models.board, {
      // user.boards to get all the users boards
      // property on the source to refer to target
      as: 'boards',
      foreignKey: 'ownerId', // ownerId field in the boards table
    });
  };
  return user;
};
