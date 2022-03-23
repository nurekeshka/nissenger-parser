const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const directoryPath = path.join(__dirname, 'excel');
const MainWorkBook = new ExcelJS.Workbook();
const WorkSheet = MainWorkBook.addWorksheet("main");

fs.readdir(directoryPath, function (err, files) {
    
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    
    files.forEach(function (file) {
        if (file.endsWith(".xlsx")) {
            const FileWorkBook = new ExcelJS.Workbook();
            FileWorkBook.xlsx.readFile(path.join(directoryPath, file))
                .then(function () {
                    const FileWorkSheet = FileWorkBook.getWorksheet('lesson');
                    
                    FileWorkSheet.eachRow(function (row, rowNumber) {
                        WorkSheet.addRow(row.values).commit();
                    });

                    MainWorkBook.xlsx.writeFile("timetable.xlsx");
                })
                .catch(function (err) {});
            fs.unlink(path.join(directoryPath, file), () => {
                console.log(`Packed:\t${file}`);
            });
        }
    });
});