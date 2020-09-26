module.exports = function (sequlize, DataTypes) {
  const InfectedUser = sequlize.define(
    'InfectedUser',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(1024),
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
      infectedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      infectedTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      tableName: 'InfectedUser',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  InfectedUser.associate = (models) => {
    // User.hasMany(models.Scene)
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return InfectedUser
}
