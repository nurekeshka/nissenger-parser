const FormData = require("form-data");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { default: Axios } = require("axios");
require("dotenv").config();

const NewVersion = "timetable.xlsx";
const OldVersion = "previous.xlsx";

function UploadFile(file) {
  const Data = new FormData();
  Data.append("file", fs.createReadStream(file));

  return Axios({
    method: "POST",
    url: "https://api.nissenger.com/timetables/upload-timetable",
    // url: "http://localhost:3000/timetables/upload-timetable",
    data: {
      Data,
    },
  });
}

function SendToTelegram(message) {
  Axios({
    method: "GET",
    url: `https://api.telegram.org/bot${process.env.TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${message}`,
  }).catch((error) => {console.log(error);});
}

function AfterUpload(response) {
  if (response.status === 201) {
    SendToTelegram("File upload went successfully!");
  } else {
    SendToTelegram(
      `File upload finished with responce status: ${response.status}`
    );
  }
}

async function CheckForChange(file, compare) {
  const FileWorkbook = new ExcelJS.Workbook();
  const CompareWorkbook = new ExcelJS.Workbook();
  await Promise.all([
    FileWorkbook.xlsx.readFile(file),
    CompareWorkbook.xlsx.readFile(compare)
  ]).catch((error) => {
    console.log(error);
  });

  const FileSheet = FileWorkbook.getWorksheet("Sheet");
  const CompareSheet = CompareWorkbook.getWorksheet("Sheet");
  if (FileSheet.rowCount != CompareSheet.rowCount) {
    return true;
  }
  for (let row = 1; row < FileSheet.rowCount; row++) {
    for (let cell = 1; cell < 10; cell++) {
        // console.log(`${row}:${cell}\nFile #1: ${FileSheet.getRow(row).getCell(cell).value}\nFile #2: ${CompareSheet.getRow(row).getCell(cell).value}\n\n`)
        if (FileSheet.getRow(row).getCell(cell).value != CompareSheet.getRow(row).getCell(cell).value) {
            return true;
        }
    }
  }
  return false;
}

async function Main() {
    if (fs.existsSync(OldVersion) && fs.existsSync(NewVersion)) {
        const Changed = await CheckForChange(NewVersion, OldVersion);
        if (Changed === true) {
            UploadFile(NewVersion).then((response) => {AfterUpload(response)});
        } else {
            SendToTelegram("Current version is okay!\n:)")
        }
    } else {
        if (fs.existsSync(NewVersion)) {
            UploadFile(NewVersion).then((response) => {AfterUpload(response)});
        } else {
            SendToTelegram("Something broke!\n:)")
        }
    }
}

Main();
