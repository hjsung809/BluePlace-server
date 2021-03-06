module.exports = function (sequlize, DataTypes) {
  const Region = sequlize.define(
    'Region',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
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
      incDecAllCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      incDecInCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      incDecOutCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      patientCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      isolProcCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      isolClearCnt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      },
      deathCnt: {
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
    Region.belongsToMany(models.User, { through: 'UserRegion' })
    // Region.hasMany(models.InfectedPlace)
  }
  return Region
}
