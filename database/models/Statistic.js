module.exports = function (sequelize, DataTypes) { 
  // console.log(DataTypes)
  const Statistic = sequelize.define('Statistic', {
    Id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    data: { 
      type: DataTypes.STRING(4000), 
      allowNull: false, 
    }, 
    time: { 
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    }, 
  },
  { 
    tableName: 'Statistic',
    freezeTableName: false,
    timestamps: true,
    underscored: false,
  })

  return Statistic
}
