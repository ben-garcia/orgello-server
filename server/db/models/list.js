module.exports = (sequelize, DataTypes) => {
  const list = sequelize.define(
    'list',
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
        validates: {
          notEmpty: true,
        },
      },
      order: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validates: {
          notEmpty: true,
        },
      },
      boardId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {},
  );
  list.associate = (models) => {
    // list is the source
    // board is the target
    list.belongsTo(models.board, {
      // property on the source(list) to refer to the target(board)
      as: 'board', // board.lists
      foreignKey: 'boardId', // field in the lists table that points to list PK
    });
    // list is the source
    // card is the target
    list.hasMany(models.card, {
      // property on the source(list) to refer to the target(card)
      as: 'cards', // list.cards
      foreignKey: 'listId', // field in the card tabel that ponts to list PK
    });
  };
  return list;
};
