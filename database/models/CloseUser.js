/* eslint-disable camelcase */
module.exports = function (sequlize, DataTypes) {
  const CloseUser = sequlize.define(
    'CloseUser',
    {
      hLookat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      tableName: 'CloseUser',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )

  return CloseUser
}
