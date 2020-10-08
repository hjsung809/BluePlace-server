/* eslint-disable camelcase */
module.exports = function (sequlize, DataTypes) {
  const UserClose = sequlize.define(
    'UserClose',
    {
      active: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      tableName: 'UserClose',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )

  return UserClose
}
