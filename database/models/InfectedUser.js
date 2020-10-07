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
    InfectedUser.belongsTo(models.User)
    InfectedUser.hasMany(models.InfectedPlace)
  }
  return InfectedUser
}
