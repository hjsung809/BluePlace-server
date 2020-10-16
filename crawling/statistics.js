

const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

const getHtml = async () => {
  try {
    return await axios.get("http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=13&ncvContSeq=&contSeq=&board_id=&gubun=");
  } catch (error) {
    console.error(error);
  }
};

const getStatistics = function() {
  return new Promise(
    (resolve, reject) => {
      try {
        getHtml()
          .then(html => {
            const $ = cheerio.load(html.data);
            const $time = $("div.timetable").children('p.info').children()
            const dataTable = $("div.data_table")
            const $dataTableThead = dataTable.children('table.num.midsize').children('thead')
            const $dataTableTbody = dataTable.children('table.num.midsize').children('tbody')
            const dataTableTheadArr = []
            const dataTableTbodyArr = []
            const time = $time[0].children[0].data.trim()
            // log($time[0].children[0].data.trim())
            // log($dataTableThead.children()[0].children[0])
            for(let trIdx = 0; trIdx < $dataTableThead.children().length; trIdx++){
              const $tr = $dataTableThead.children()[trIdx]
              for(let thIdx = 0; thIdx < $tr.children.length; thIdx++){
                const $th = $tr.children[thIdx]
                if($th.children){
                  let text = ''
                  for(let textIdx = 0; textIdx < $th.children.length; textIdx++){
                    if($th.children[textIdx].type === 'text') {
                      // console.log($th.children[textIdx])
                      text += $th.children[textIdx].data
                    }else if($th.children[textIdx].name === 'br') {
                      text += ' '
                    }
                  }
                  dataTableTheadArr.push(text)
                }
              }
            }
            for(let trIdx = 0; trIdx < $dataTableTbody.children().length; trIdx++){
              const $tr = $dataTableTbody.children()[trIdx]
              const tmpArr = []
              for(let thIdx = 0; thIdx < $tr.children.length; thIdx++){
                const $th = $tr.children[thIdx]
                if($th.children){
                  let text = ''
                  for(let textIdx = 0; textIdx < $th.children.length; textIdx++){
                    if($th.children[textIdx].type === 'text') {
                      // console.log($th.children[textIdx])
                      text += $th.children[textIdx].data
                    }else if($th.children[textIdx].name === 'br') {
                      text += ' '
                    }
                  }
                  tmpArr.push(text)
                }
              }
              dataTableTbodyArr.push(tmpArr)
            }
            // log(dataTableTheadArr)
            // log(dataTableTbodyArr)
            resolve( {time, dataTableTheadArr, dataTableTbodyArr})
          })
      } catch (error) {
        console.error(error)
        reject(error)
      }
    }
  )
}
exports.getStatistics = getStatistics;
