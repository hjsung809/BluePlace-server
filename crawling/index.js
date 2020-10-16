const statistics = require("./statistics.js")
const place = require("./place.js")
const log = console.log
const request = require('request')
const APIKEY = '05155040bd41ead57e6020cd820e2b40'

function main() {
  crawl()
  setInterval(crawl, 1 * 60 * 60 * 1000);
} 

async function crawl() {
  const statisticsResult = await statistics.getStatistics()
  const placeResult = await place.getPlaces()
  
  const testPlaceResult = {
    theadarr: [ '지역', '유형', '상호명', '노출', '소독' ], 
    tbodyarr: [['광주', '북구', '시장', '말바우시장 (광주 북구 동문대로85번길 62)', '8/22~9/4', '완료']]
  }

  // TODO: create new statistics log
  // TODO: create new place log
  log(statisticsResult)
  log(placeResult)

  // TODO: update to new statistics
  updateDBStatistic(statisticsResult)
  updateDBInfectedPlace(testPlaceResult)
  // TODO: update to new place
}

async function updateDBStatistic(result) {
  const month = result.time.split('.')[0]
  const day = result.time.split('.')[1]
  const time = result.time.split(' ')[1].split('시')[0]
  db.Statistic.create({
    data: JSON.stringify(result.dataTableTbodyArr),
    time:`2020-${month}-${day} ${time}:00:00`
  })
  .then(result => {
    console.log(result)
  })
  .catch(err => {
    console.error(err);
  });
  result.dataTableTbodyArr.forEach(region => {
    console.log(region)
    db.Region.update({
      stdDay: result.time,
      updateDT: result.time,
      deathCnt: region[7].replaceAll(',', ''),
      incDecCnt: region[1].replaceAll(',', ''),
      isolClearCnt: region[6].replaceAll(',', ''),
      qurRate: region[8] == '-' ? 0 : region[8].split('.')[0]
    },
    {
      where: {
        regionName: region[0]
      }
    }).then(result => {
      console.log(result)
    })
  })
  
}
async function updateDBInfectedPlace(result) {
  const addressRe = /(\([가-힣a-zA-Z0-9 ]+\))/g
  result.tbodyarr.forEach(place => {
    const address = place[3]
    searchByAdressKAKAO(address.match(addressRe)[0])
    .then(result => {
      log(result)
      db.InfectedPlace.create({
        infectedPlaceName: place[3].split('(')[0].trim(), 
        infectedPlaceNameEn: `-`,
        adress: place[3],
        note: `소독: ${place[5]}`,
        longitude: result.documents[0].x,
        latitude: result.documents[0].y,
        infectedDate: `2020-${place[4].split('~')[0].split('/')[0].padStart(2, '0')}-${place[4].split('~')[0].split('/')[1].padStart(2, '0')} 00:00:00`,
        infectedTime: `00:00:00`,
        createAt: ``,
        updateAt: ``,
      })
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.error(err);
      });
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

sequelize.sync()
.then(() => {
  main()
  // searchByAdressKAKAO('광주 북구 동문대로85번길 62')
  //   .then(result => {
  //     log(result.documents[0].address)
  //   })
})