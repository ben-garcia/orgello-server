module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lists', {
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
      boardId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          // has a reference to the boards table
          model: 'boards',
          key: 'id',
        },
        // when the board is deleted so will the lists associated with it
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
    return queryInterface.dropTable('lists');
  },
};
