import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'

import config from './data/config.json'
import initData from './data/initData.json'
import { initCliqueType, initRegion } from './init'
import crawling from '../crawling'

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

const db = {}
sequelize.authenticate().then(() => {
  console.log('authenticated DB')
})

fs.readdirSync(path.join(__dirname, 'models'))
  .filter(function (file) {
    return (
      file.indexOf('.') !== 0 // && file !== 'index.js' && file !== 'config.json'
    )
  })
  .forEach(function (file) {
    const model = require(path.join(__dirname, 'models', file))(
      sequelize,
      Sequelize
    )
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sql = sequelize
db.Sequelize = Sequelize
;(async () => {
  // initData.init이 true 일때, 한번만 실행되게 함. global(전역)에 dbInitialized를 선언하여 검사.
  await sequelize.sync({ force: initData.init && !global.dbInitialized })
  // console.log('init flags', initData.init, global.dbInitialized)
  if (initData.init && !global.dbInitialized) {
    // global.dbInitialized 를 true로 하여, 다시 실행되지 않게함.
    global.dbInitialized = true
    await initCliqueType(db.CliqueType)
    await initRegion(db.Region)
    
    crawling.start(db)
  }
})()

export default db
