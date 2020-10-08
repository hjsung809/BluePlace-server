import fs from 'fs'
import path from 'path'

const initDataPath = path.join(__dirname, 'data', 'initData.json')
const initDataFile = fs.readFileSync(initDataPath)
const initData = JSON.parse(initDataFile)

export async function initCliqueType(CliqueType) {
  try {
    await CliqueType.bulkCreate(initData.CliqueTypes, {
      ignoreDuplicates: true,
    })
  } catch (e) {
    console.log(e)
  }
}

export async function initRegion(Region) {
  try {
    await Region.bulkCreate(initData.Regions, {
      ignoreDuplicates: true,
    })
  } catch (e) {
    console.log(e)
  }
}

// export async function initRegion() {
//   // hello
//   console.log('initCliqueType', initData)
// }
