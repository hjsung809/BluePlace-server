/* eslint-disable camelcase */
module.exports = function (sequlize, DataTypes) {
  const UserClique = sequlize.define(
    'UserClique',
    {
      active: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      tableName: 'UserClique',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )
  return UserClique
}
