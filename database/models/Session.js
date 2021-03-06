module.exports = function (sequlize, DataTypes) {
  const Session = sequlize.define(
    'Session',
    {
      Id: {
        type: DataTypes.STRING(1024),
        primaryKey: true,
        allowNull: false,
      },
      //   expireDateTime: {
      //     type: DataTypes.DATE,
      //     allowNull: false,
      //   },
    },
    {
      tableName: 'Session',
      freezeTableName: false,
      timestamps: true,
      underscored: false,
    }
  )
  Session.associate = (models) => {
    Session.belongsTo(models.User)
  }
  return Session
}
