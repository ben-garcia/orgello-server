module.exports = (sequelize, DataTypes) => {
  const board = sequelize.define(
    'board',
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
        validates: {
          notEmpty: true,
        },
      },
      background: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      ownerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {},
  );
  board.associate = (models) => {
    // board is the source
    // user is the target
    board.belongsTo(models.user, {
      // property on the source(board) to refer to the target(user)
      as: 'owner', // board.owner
      foreignKey: 'ownerId', // field in boards table that points to users PK
    });

    // board is the source
    // list is the target
    board.hasMany(models.list, {
      // property on the target(list) to refer to the source(board)
      as: 'lists', // board.lists
      foreignKey: 'boardId', // field in list that points to board PK
    });
  };
  return board;
};
