const excelJs = require("exceljs");
const { default: axios } = require("axios");
const fs = require("fs");
require("dotenv").config();

newVersion = process.env.NEW_VERSION_NAME;
oldVersion = process.env.OLD_VERSION_NAME;

function sendToTelegram(message) {
  axios({
    method: "GET",
    url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.TIMETABLE_CHAT_ID}&text=${message}`,
  }).catch((error) => {
    console.log(error);
  });
}

async function checkForChange(filename, comparename) {
  const fileWorkbook = new excelJs.Workbook();
  const compareWorkbook = new excelJs.Workbook();

  await Promise.all(
    fileWorkbook.xlsx.readFile(filename),
    compareWorkbook.xlsx.readFile(comparename)
  );

  const fileSheet = fileWorkbook.getWorksheet(process.env.SHEET_NAME);
  const compareSheet = compareWorkbook.getWorksheet(process.env.SHEET_NAME);

  if (fileSheet.rowCount != compareSheet.rowCount) {
    return true;
  }

  for (let row = 1; i < fileSheet.rowCount; row++) {
    for (let cell = 1; cell < 10; cell++) {
      if (
        fileSheet.getRow(row).getCell(cell).value !=
        compareSheet.getRow(row).getCell(cell).value
      ) {
        return true;
      }
    }
  }

  return false;
}

async function main() {
  if (fs.existsSync(oldVersion) && fs.existsSync(newVersion)) {
    const changed = await checkForChange(newVersion, oldVersion);

    if (changed) {
      sendToTelegram("Timetable was updated on website");
    } else {
      sendToTelegram("Timetable did not change");
    }
  } else {
    sendToTelegram(
      "Older version of timetable was not found. Update timetable anyway"
    );
  }
}

main();
