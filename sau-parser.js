const ExcelJS = require("exceljs");
// sheets[i].columnCount

class SAU {
    constructor(SUBJECT, CLASS, GROUP, DATE) {
        this.SUBJECT = SUBJECT;
        this.CLASS = CLASS;
        this.GROUP = GROUP;
        this.DATE = DATE;
    }

    GetInfo() {
        console.log(`
            SUBJECT: ${this.SUBJECT}\t
            CLASS: ${this.CLASS}\t
            GROUP: ${this.GROUP}\t
            DATE: ${this.DATE}
        `);
    }
}

async function Main(filename) {
    const Workbook = new ExcelJS.Workbook();
    await Workbook.xlsx.readFile(`./SAU/${filename}`);
    ParseSheet(Workbook.worksheets[1].name, filename);
}

async function ParseSheet(sheetname, filename) {
    const Workbook = new ExcelJS.Workbook();
    await Workbook.xlsx.readFile(`./SAU/${filename}`);
    const Sheet = Workbook.getWorksheet(sheetname);
    for (let r = 7; r < Sheet.rowCount - 1; r++) {
        for (let c = 3; c < Sheet.columnCount; c++) {
            if (Sheet.getRow(r).getCell(c).value) {
                SAU(
                    Sheet.getRow(r).getCell(c).value
                ).GetInfo();
            }
        }
    }
}

Main('sau-timetable.xlsx');