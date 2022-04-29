const { default: axios } = require("axios");
const excelJs = require("exceljs");
const formatFunctions = require("./formatting-functions.js");
const fs = require("fs");

require("dotenv").config();

const newVersion = `./excel/${process.env.NEW_VERSION_NAME}`;
const oldVersion = `./excel/${process.env.OLD_VERSION_NAME}`;

function getNameInTable(table, id) {
  for (let j = 0; j < table.length; j++) {
    if (table[j].id == id) {
      return table[j].name;
    }
  }
}

function getShortInTable(table, id) {
  for (let j = 0; j < table.length; j++) {
    if (table[j].id == id) {
      return table[j].short;
    }
  }
}

function getStartOfThisWeek() {
  let date = new Date();
  if (date.getDay() == 0) {
    throw "Sunday is today! Check it out, if timetable is empty";
  }
  date.setDate(date.getDate() - date.getDay() + 1);
  date.setHours(23, 59, 59);
  return date.toISOString().slice(0, 10).replace("T", " ");
}

function getEndOfThisWeek() {
  let date = new Date();
  if (date.getDay() == 0) {
    throw "Sunday is today! Check it out, if timetable is empty";
  }
  date.setDate(date.getDate() - date.getDay() + (date.getDay() ? 7 : 0));
  date.setHours(23, 59, 59);
  return date.toISOString().slice(0, 10).replace("T", " ");
}

async function getDatabase() {
  return axios({
    method: "POST",
    url: "https://fmalmnis.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor",
    data: {
      __args: [
        "null",
        2021,
        {
          vt_filter: {
            datefrom: getStartOfThisWeek(),
            dateto: getEndOfThisWeek(),
          },
        },
        {
          op: "fetch",
          needed_part: {
            teachers: ["short"],
            classes: ["name"],
            classrooms: ["short"],
            subjects: ["name"],
            periods: ["starttime", "endtime"],
          },
        },
      ],
      __gsh: "00000000",
    },
  });
}

async function getTimetableOfClass(id) {
  return axios({
    url: "https://fmalmnis.edupage.org/timetable/server/currenttt.js?__func=curentttGetData",
    method: "POST",
    data: {
      __args: [
        null,
        {
          year: 2021,
          datefrom: getStartOfThisWeek(),
          dateto: getEndOfThisWeek(),
          table: "classes",
          id: id,
          showOrig: true,
          log_module: "CurrentTTView",
        },
      ],
      __gsh: "00000000",
    },
  });
}

async function download(filename) {
  const database = await getDatabase();

  const teacherTable = database.data.r.tables[0].data_rows;
  const subjectTable = database.data.r.tables[1].data_rows;
  const officeTable = database.data.r.tables[2].data_rows;
  const classTable = database.data.r.tables[3].data_rows;
  const periodTable = database.data.r.tables[4].data_rows;

  let classPromises = Array();
  let classNames = Array();

  classTable.map((classObject) => {
    classPromises.push(getTimetableOfClass(classObject.id));
    classNames.push(getNameInTable(classTable, classObject.id));
  });

  const timetables = await Promise.all(classPromises);

  const workbook = new excelJs.Workbook();
  const worksheet = workbook.addWorksheet("Sheet");

  for (let index = 0; index < timetables.length; index++) {
    const classGrade = classNames[index].slice(0, classNames[index].length - 1);
    const classLetter = classNames[index].charAt(classNames[index].length - 1);

    timetables[index].data.r.ttitems.map(function (lesson) {
      const subjectName = formatFunctions.formatName(
        getNameInTable(subjectTable, lesson.subjectid)
      );
      const subjectTeacher = formatFunctions.formatTeacher(
        getShortInTable(teacherTable, lesson.teacherids[0])
      );
      const subjectOffice = formatFunctions.formatOffice(
        getShortInTable(officeTable, lesson.classroomids[0])
      );
      const subjectDuration =
        lesson.durationperiods === undefined ? 1 : lesson.durationperiods;
      const subjectDay = formatFunctions.formatDay(lesson.date);
      const subjectGroups =
        subjectName == "Математика (10)" ||
        subjectName == "Физика ВСО" ||
        subjectName == "Химия ВСО" ||
        subjectName == "Информатика ВСО" ||
        subjectName == "Биология ВСО"
          ? [""]
          : formatFunctions.formatGroups(lesson.groupnames[0]);

      let subjectProfile;

      if (classGrade == "11" || classGrade == "12") {
        subjectProfile = formatFunctions.formatProfile(lesson.groupnames[0]);
      } else {
        subjectProfile = "";
      }

      for (
        let period = +lesson.uniperiod - 1;
        period < +lesson.uniperiod - 1 + subjectDuration;
        period++
      ) {
        subjectGroups.map(function (subjectGroup) {
          worksheet
            .addRow([
              formatFunctions.formatTime(periodTable[period].starttime),
              formatFunctions.formatTime(periodTable[period].endtime),
              subjectName,
              subjectTeacher,
              subjectOffice,
              classGrade,
              classLetter,
              subjectDay,
              subjectGroup,
              subjectProfile,
            ])
            .commit();
        });
      }
    });
  }
  await workbook.xlsx.writeFile(filename);
}

function main() {
  if (fs.existsSync(oldVersion)) {
    fs.unlink(oldVersion, () => {});
  }
  if (fs.existsSync(newVersion)) {
    fs.rename(newVersion, oldVersion, () => {});
  }

  download(newVersion);
}

main();
