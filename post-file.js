const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

function UploadFile(file) {
    const Data = new FormData();
    Data.append("file", fs.createReadStream(file));
  
    return Axios({
      method: "POST",
      // url: "https://api.nissenger.com/timetables/upload-timetable",
      url: "http://localhost:3000/timetables/upload-timetable",
      data: {
        Data,
      },
    });
  }
  
  function SendToTelegram(message) {
    Axios({
      method: "GET",
      url: `https://api.telegram.org/bot${process.env.TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${message}`,
    });
  }
  
  function AfterUpdate(response) {
    if (response.status === 201) {
      SendToTelegram("File update went successfully!");
    } else {
      SendToTelegram(
        `File update finished with responce status: ${response.status}`
      );
    }
  }
  
  async function CheckForChange(file, compare) {
    const FileWorkbook = new ExcelJS.Workbook();
    const CompareWorkbook = new ExcelJS.Workbook();
  
    try {
      await Promise.all([
        FileWorkbook.xlsx.readFile(file),
        CompareWorkbook.xlsx.readFile(compare)
      ]);
    
      const FileSheet = FileWorkbook.getWorksheet("Sheet");
      const CompareSheet = CompareWorkbook.getWorksheet("Sheet");
      if (FileSheet.rowCount != CompareSheet.rowCount) {
        return true;
      }
      for (let index = 0; index < FileSheet; index++) {
        if (FileSheet.getRow(index) != CompareSheet.getRow(index)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return error;
    }
  }