module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
        validates: {
          notEmpty: true,
        },
      },
      order: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validates: {
          notEmpty: true,
        },
      },
      archived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      listId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'lists',
          key: 'id',
        },
        // when the list is deleted so are all the cards associated with it
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  // eslint-disable-next-line
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cards');
  },
};
