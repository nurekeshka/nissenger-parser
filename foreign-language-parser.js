const cheerio = require("cheerio"),
  axios = require("axios"),
  url = `https://fmalmnis.edupage.org/a/---2`;

axios
  .get(url)
  .then((response) => {
    let $ = cheerio.load(response.data);
    $("table").each(function (TableIndex, TableElement) {
      $(TableElement).find("tr").each(function (RowIndex, RowElement) {
        let str = "| ";
        $(RowElement).find("td").each(function (CellIndex, CellElement) {
          str += $(CellElement).text().trim();
          str += "| ";
        });
        console.log(str);
        console.log("_".repeat(str.length))
      });
      console.log("-".repeat(32));
    });
  })
  .catch(function (e) {
    console.log(e);
  });
