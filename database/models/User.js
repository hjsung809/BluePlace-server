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
      userNickname: {
        type: DataTypes.STRING(20),
        unique: true,
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
      timestamps: true,
      underscored: false,
    }
  )
  User.associate = (models) => {
    User.hasOne(models.Session)
    User.hasMany(models.Clique, {
      as: 'CliqueOwner',
      foreignKey: 'CliqueOwnerId',
    })
    User.hasOne(models.InfectedUser)
    User.belongsToMany(User, {
      as: 'RelatedUser',
      through: 'UserClose',
      foreignKey: 'RelatedUserId'
    })
    User.belongsToMany(User, {
      as: 'SelfUser',
      through: 'UserClose',
      foreignKey: 'UserId'
    })
    User.belongsToMany(models.Region, { through: 'UserRegion' })
    User.belongsToMany(models.Clique, { as: 'CliqueMember', through: 'UserClique' })
  }
  return User
}
