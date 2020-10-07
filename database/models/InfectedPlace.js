module.exports = function (sequlize, DataTypes) {
  const InfectedPlace = sequlize.define(
    'InfectedPlace',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      infectedPlaceName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      infectedPlaceNameEn: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      adress: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DOUBLE,
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
      tableName: 'InfectedPlace',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  InfectedPlace.associate = (models) => {
    InfectedPlace.belongsTo(models.InfectedUser)
    InfectedPlace.belongsTo(models.Region)
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return InfectedPlace
}
