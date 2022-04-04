const ExcelJS = require("exceljs");

const NewVersion = "timetable.xlsx";

function CheckTheCell(Worksheet, row, col) {
    if (Worksheet.getRow(row).getCell(col).value == "") {
        throw(`Error: <${Worksheet.getRow(row).getCell(6)}> grade, ${row}:${col} is empty`);
    } else {
        console.log(`${row}:${col}`);
    }
}

async function Test(file) {
    const Workbook = new ExcelJS.Workbook();
    await Workbook.xlsx.readFile(file);
    const Worksheet = Workbook.getWorksheet("Sheet");
    for (let row = 1; row <= Worksheet.rowCount; row++) {
        switch(Worksheet.getRow(row).getCell(6).value) {
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
                throw("Class does not exist!");
        }
    }
    console.log("File is okay!");
}

Test(NewVersion).catch((error) => {console.log(error);});