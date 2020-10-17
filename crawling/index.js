const statistics = require("./statistics.js")
const place = require("./place.js")
const log = console.log
const request = require('request')
const APIKEY = '05155040bd41ead57e6020cd820e2b40'

let db

function main() {
  crawl()
  setInterval(crawl, 1 * 60 * 60 * 1000);
} 

async function crawl() {
  log(`Log(${new Date().toLocaleString('ko-KR', { timeZone: 'UTC' })}): Crawling... `)
  const statisticsResult = await statistics.getStatistics()
  const placeResult = await place.getPlaces()
  
  const testPlaceResult = {
    theadarr: [ '지역', '유형', '상호명', '노출', '소독' ], 
    tbodyarr: [['광주', '북구', '시장', '말바우시장 (광주 북구 동문대로85번길 62)', '8/22~9/4', '완료']]
  }

  // TODO: create new statistics log
  // TODO: create new place log
  // log(statisticsResult)
  // log(placeResult)

  // TODO: update to new statistics
  updateDBStatistic(statisticsResult)
  

  // TODO: update to new place
  // updateDBInfectedPlace(placeResult)
  updateDBInfectedPlace(testPlaceResult)
}

async function updateDBStatistic(result) {
  const month = result.time.split('.')[0]
  const day = result.time.split('.')[1]
  const time = result.time.split(' ')[1].split('시')[0]
  const statistic = await db.Statistic.create({
    data: JSON.stringify(result.dataTableTbodyArr),
    time: `2020-${month}-${day} ${time}:00:00`
  })
  
  result.dataTableTbodyArr.forEach(async function(region) {
    // console.log(region)
    const rg = await db.Region.findOne({
      where: {
        regionName: region[0]
      }
    })
    rg.stdDay = result.time
    rg.updateDT = result.time
    rg.deathCnt = parseInt(region[7].replace(/,/g, ''))
    rg.isolClearCnt = parseInt(region[6].replace(/,/g, ''))
    rg.qurRate = region[8] == '-' ? 0 : parseFloat(region[8])
    rg.incDecAllCnt = parseInt(region[1].replace(/,/g, ''))
    rg.incDecInCnt = parseInt(region[2].replace(/,/g, ''))
    rg.incDecOutCnt = parseInt(region[3].replace(/,/g, ''))
    rg.patientCnt = parseInt(region[4].replace(/,/g, ''))
    rg.isolProcCnt = parseInt(region[5].replace(/,/g, ''))
    await rg.save()
  })
  
}
async function updateDBInfectedPlace(result) {
  const addressRe = /(\([가-힣a-zA-Z0-9 ]+\))/g
  const date = Date.now()
  result.tbodyarr.forEach(place => {
    const address = place[3]
    searchByAdressKAKAO(address.match(addressRe)[0])
    .then(async function(result) {
      // log(result)
      const infectedPlace = await db.InfectedPlace.create({
        infectedPlaceName: place[3].split('(')[0].trim(),
        infectedPlaceNameEn: `-`,
        adress: place[3],
        note: `소독: ${place[5]}`,
        longitude: result.documents[0].x,
        latitude: result.documents[0].y,
        infectedDate: `2020-${place[4].split('~')[0].split('/')[0].padStart(2, '0')}-${place[4].split('~')[0].split('/')[1].padStart(2, '0')} 00:00:00`,
        infectedTime: `00:00:00`,
        createAt: date,
        updateAt: date,
        firstVisitTime: `2020-${place[4].split('~')[0].split('/')[0].padStart(2, '0')}-${place[4].split('~')[0].split('/')[1].padStart(2, '0')} 00:00:00`,
        lastVisitTime: `2020-${place[4].split('~')[0].split('/')[0].padStart(2, '0')}-${place[4].split('~')[0].split('/')[1].padStart(2, '0')} 23:59:59`,
      })
    })
  });
}

function searchByAdressKAKAO(queryString){
  return new Promise((resolve, reject) => {
    const options = {
      uri: "https://dapi.kakao.com/v2/local/search/address.json",
      qs: {
        query: queryString
      },
      headers: {
        'Authorization': `KakaoAK ${APIKEY}`
      }
    } 
    request(options, function (error, response, body) {
      // log(response)
      if(error) {
        reject(error)
      }else{
        // log(JSON.parse(body))
        resolve(JSON.parse(body))
      }
      
      
    });
  })
}

function start(database) {
  db = database
  main()
}

exports.start = start;
