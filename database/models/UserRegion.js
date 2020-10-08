module.exports = function (sequlize, DataTypes) {
  const UserRegion = sequlize.define(
    'UserRegion',
    {
      // active: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 1,
      //   allowNull: false,
      // },
    },
    {
      tableName: 'UserRegion',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )

  return UserRegion
}
