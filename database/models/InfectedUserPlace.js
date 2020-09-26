module.exports = function (sequlize, DataTypes) {
  const InfectedUserPlace = sequlize.define(
    'InfectedUserPlace',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
      },
      infectedUserPlaceName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      infectedUserPlaceNameEn: {
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
      tableName: 'InfectedUserPlace',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  InfectedUserPlace.associate = (models) => {
    // User.hasMany(models.Scene)
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return InfectedUserPlace
}
