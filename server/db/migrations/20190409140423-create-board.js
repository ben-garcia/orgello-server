module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('boards', {
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
      background: {
        allowNull: false,
        defaultValue: '#ffffff',
        type: Sequelize.STRING,
      },
      ownerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          // points to the users table as 'ownerId'
          model: 'users',
          key: 'id',
        },
        // when the user is deleted then so will all his/her boards
        onDelete: 'cascade',
        // any updates will effect the users boards too
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
    return queryInterface.dropTable('boards');
  },
};
