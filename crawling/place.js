

const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

const getHtml = async () => {
  try {
    return await axios.get("http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=12&ncvContSeq=&contSeq=&board_id=&gubun=");
  } catch (error) {
    console.error(error);
  }
};

const getPlaces = function(){
  return new Promise(
    (resolve, reject) => {
      try {
        getHtml()
        .then(html => {
          let ulList = [];
          const $ = cheerio.load(html.data);
          const $thead = $("table.midsize.big").children("thead").children("tr").children("th")
          const $tbody = $("table.midsize.big").children("tbody").children("tr")

          // log($thead)
          // log($tbody)
          theadarr = []
          for(i = 0; i < $thead.length; i++){
            if($thead[i].name == "th"){
              theadarr.push($thead[i].children[0].data)
            }
          }

          // log(theadarr)


          tbodyarr = []
          for(i = 0; i < $tbody.length; i++){
            if($tbody[i].attribs.class == "sumline_cmn_top"){
              continue;
            }
            $tr = $tbody[i]
            // log($tr)
            tmparr = []
            for(j = 0; j < $tr.children.length; j++){
              if($tr.children[j].name == "td"){
                // log($tr.children[j].children[0].data)
                tmparr.push($tr.children[j].children[0].data)
              }

            }
            tbodyarr.push(tmparr)
          }
          // log(tbodyarr)


          resolve( {theadarr, tbodyarr});
        })
      } catch (error) {
        console.error(error);
        reject(error)
      }
    }
  )
}
exports.getPlaces = getPlaces;
