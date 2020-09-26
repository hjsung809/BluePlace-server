module.exports = function (sequlize, DataTypes) {
  const User = sequlize.define(
    'User',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(1024),
        unique: true,
        allowNull: false,
      },
      userPassword: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
      userPhoneNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'User',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  User.associate = (models) => {
    // User.hasMany(models.Scene)
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return User
}