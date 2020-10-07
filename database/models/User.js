module.exports = function (sequlize, DataTypes) {
  const User = sequlize.define(
    'User',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.STRING(1024),
        unique: true,
        allowNull: false,
      },
      userPassword: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING(100),
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
    User.hasOne(models.Session)
    User.hasOne(models.InfectedUser)
    User.belongsToMany(User, {
      as: 'RelatedUser',
      through: 'CloseUser',
    })
    User.belongsToMany(models.Region, { through: 'UserRegion' })
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return User
}
