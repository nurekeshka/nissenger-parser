const ExcelJS = require("exceljs");

const NewVersion = "timetable.xlsx";
const WeekDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function CheckTheCell(Worksheet, row, col) {
  switch (col) {
    case 1:
    case 2:
    case 3:
    case 4:
      if (Worksheet.getRow(row).getCell(col).value) {
        console.log(`${row}:${col}`);
      } else {
        throw `Error: <${Worksheet.getRow(row).getCell(
            6
          )}> grade, ${row}:${col} is empty`;
      }
      break;
    case 6:
    case 9:
      if (isNaN(Number(Worksheet.getRow(row).getCell(col).value))) {
        throw `Error: <${Worksheet.getRow(row).getCell(
          6
        )}> grade, ${row}:${col} is not digit`;
      } else {
        console.log(`${row}:${col}`);
      }
      break;
    case 7:
      if (Worksheet.getRow(row).getCell(7).value.length != 1) {
        throw `Error: <${Worksheet.getRow(row).getCell(
          6
        )}> grade, ${row}:${col} is not a letter`;
      } else {
        console.log(`${row}:${col}`);
      }
      break;
    case 8:
      if (WeekDays.includes(Worksheet.getRow(row).getCell(8).value)) {
        console.log(`${row}:${col}`);
      } else {
        throw `Error: <${Worksheet.getRow(row).getCell(
          6
        )}> grade, ${row}:${col} does not follow format`;
      }
      break;
    case 5:
    case 10:
      break;
    default:
      throw `Error: <${Worksheet.getRow(row).getCell(
        col
      )}> grade, ${row}:${col} - column should be from 1 to 10`;
  }
}

async function Test(file) {
  const Workbook = new ExcelJS.Workbook();
  await Workbook.xlsx.readFile(file);
  const Worksheet = Workbook.getWorksheet("Sheet");
  for (let row = 1; row <= Worksheet.rowCount; row++) {
    switch (Worksheet.getRow(row).getCell(6).value) {
      case "7":
      case "8":
      case "9":
        for (let column = 1; column < Worksheet.columnCount; column++) {
          CheckTheCell(Worksheet, row, column);
        }
        break;
      case "10":
        switch (Worksheet.getRow(row).getCell(3).value) {
          case "Физика ВСО":
          case "Химия ВСО":
          case "Информатика ВСО":
          case "Биология ВСО":
            for (let column = 1; column < Worksheet.columnCount - 1; column++) {
              CheckTheCell(Worksheet, row, column);
            }
            break;
          default:
            for (let column = 1; column < Worksheet.columnCount; column++) {
              CheckTheCell(Worksheet, row, column);
            }
            break;
        }
        break;
      case "11":
      case "12":
        switch (Worksheet.getRow(row).getCell(3).value) {
          case "Математика (10)":
            for (let column = 1; column < Worksheet.columnCount - 1; column++) {
              CheckTheCell(Worksheet, row, column);
            }
            break;
          case "Информатика":
          case "Экономика":
          case "География":
          case "Биология":
          case "Физика":
          case "Химия":
          case "ГИП":
            for (let column = 1; column < Worksheet.columnCount - 1; column++) {
              CheckTheCell(Worksheet, row, column);
            }
            CheckTheCell(Worksheet, row, Worksheet.columnCount);
            break;
          default:
            for (let column = 1; column < Worksheet.columnCount; column++) {
              CheckTheCell(Worksheet, row, column);
            }
            break;
        }
        break;
      default:
        throw "Class does not exist!";
    }
  }
  console.log("File is okay!");
}

Test(NewVersion).catch((error) => {
  console.log(error);
});
