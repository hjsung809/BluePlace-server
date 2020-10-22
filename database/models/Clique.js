module.exports = function (sequlize, DataTypes) {
  const Clique = sequlize.define(
    'Clique',
    {
      Id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cliqueName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cliqueNameEn: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'Clique',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )
  Clique.associate = (models) => {
    // Clique.hasMany(models.Session)
    Clique.belongsToMany(models.User, {  as: 'CliqueMember', through: 'UserClique' })
    Clique.belongsTo(models.User, { as: 'CliqueOwner' })
    Clique.belongsTo(models.CliqueType)
  }
  return Clique
}
