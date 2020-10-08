module.exports = function (sequlize, DataTypes) {
  const CliqueType = sequlize.define(
    'CliqueType',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cliqueTypeName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cliqueTypeNameEn: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'CliqueType',
      freezeTableName: false,
      timestamps: false,
      underscored: false,
    }
  )
  CliqueType.associate = (models) => {
    CliqueType.hasMany(models.Clique)
  }
  return CliqueType
}
