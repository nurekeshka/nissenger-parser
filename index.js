const axios = require('axios');
const ExcelJS = require('exceljs');


let date = new Date();
let period = Array();
date.setDate(date.getDate() - date.getDay() + 1);
date.setHours(23, 59, 59);
period[0] = date.toISOString().slice(0, 10).replace('T', ' ');
date = new Date();
date.setDate(date.getDate() - date.getDay() + (date.getDay() ? 7 : 0));
date.setHours(23, 59, 59);
period[1] = date.toISOString().slice(0, 10).replace('T', ' ');

const workbook = new ExcelJS.Workbook();
workbook.addWorksheet('lesson');
workbook.xlsx.writeFile('timetable.xlsx');

axios({
    method: 'POST',
    url: 'https://fmalmnis.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor',
    data: {
        "__args":
        [
            "null",
            2021,
            {
                "vt_filter":
                {
                    "datefrom":period[0],
                    "dateto":period[1]
                }
            },
            {
                "op":"fetch",
                "needed_part":
                {
                    "teachers":
                    [
                        "short"
                    ],
                    "classes":
                    [
                        "name"
                    ],
                    "classrooms":
                    [
                        "short"
                    ],
                    "subjects":
                    [
                        "name"
                    ],
                    "periods":
                    [
                        "starttime",
                        "endtime"
                    ]
                },
            }
        ],
        "__gsh":"00000000"
    }
}).then(function(response) {
    if (response.status != 200) {
        console.log('Responced: "' + response.statusText + '"\nStatus code is: ' + response.status);
        return null;
    }
    
    const teacher_table = response.data.r.tables[0].data_rows;
    const subject_table = response.data.r.tables[1].data_rows;
    const office_table = response.data.r.tables[2].data_rows;
    const class_table = response.data.r.tables[3].data_rows;
    const period_table = response.data.r.tables[4].data_rows;

    // class_table.length
    for (let _class = 0; _class < 1; _class++) {
        let class_id = class_table[_class].id.toString();
        class_id = '-1';
        axios({
            url: 'https://fmalmnis.edupage.org/timetable/server/currenttt.js?__func=curentttGetData',
            method: 'POST',
            data: {
                __args: [
                    null,
                    {
                        year: 2021,
                        datefrom: "2022-03-14",
                        dateto: "2022-03-20",
                        table: "classes",
                        id: class_id,
                        showColors: true,
                        showIgroupsInClasses: false,
                        showOrig: true,
                        log_module: "CurrentTTView",
                    }
                ],
                __gsh: "00000000",
            }
        }).then(async function (response) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile('./timetable.xlsx');
            const worksheet = workbook.getWorksheet('lesson');

            const lessons = response.data.r.ttitems;

            for (let i = 0; i < lessons.length; i++) {

                // GETTING SUBJECT'S NAME
                for (let j = 0; j < subject_table.length; j++) {
                    if (subject_table[j].id == lessons[i].subjectid) {
                        subject_name = subject_table[j].name;
                    }
                }

                // GETTING SUBJECT'S TEACHER
                for (let j = 0; j < teacher_table.length; j++) {
                    if (teacher_table[j].id == lessons[i].teacherids[0]) {
                        teacher_name = teacher_table[j].short;
                    }
                }

                // GETTING SUBJECT'S OFFICE
                for (let j = 0; j < office_table.length; j++) {
                    if (office_table[j].id == lessons[i].classroomids[0]) {
                        office = office_table[j].short;
                    }
                }

                worksheet.addRow([
                    lessons[i].starttime,
                    lessons[i].endtime,
                    subject_name,
                    teacher_name,
                    office
                ]).commit();
            }
            workbook.xlsx.writeFile('timetable.xlsx');
        }).catch(function (error) {
            console.log(error);
        });
    }
}).catch(function(err) {
    console.log(err);
});
