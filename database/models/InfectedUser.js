module.exports = function (sequlize, DataTypes) {
  const InfectedUser = sequlize.define(
    'InfectedUser',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      tableName: 'InfectedUser',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )
  InfectedUser.associate = (models) => {
    InfectedUser.belongsTo(models.User)
    InfectedUser.hasMany(models.InfectedPlace)
  }
  return InfectedUser
}
