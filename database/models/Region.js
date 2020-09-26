module.exports = function (sequlize, DataTypes) {
  const Region = sequlize.define(
    'Region',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
      },
      regionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      regionNameEn: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      stdDay: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      updateDT: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deathCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      incDecCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      isolClearCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      qurRate: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'Region',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  Region.associate = (models) => {
    // User.hasMany(models.Scene)
    // User.hasMany(models.MeasuringLine)
    // User.hasMany(models.Poi)
  }
  return Region
}
