module.exports = (sequelize, DataTypes) => {
  const card = sequelize.define(
    'card',
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
      listId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {},
  );
  card.associate = (models) => {
    // card is the source
    // list is the target
    card.belongsTo(models.list, {
      // property on the source to refer to the target
      as: 'list', // card.list
      foreignKey: 'listId',
    });
  };
  return card;
};
