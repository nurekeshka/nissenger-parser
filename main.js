const { default: Axios } = require("axios");
const ExcelJS = require("exceljs");
const Cron = require("node-cron");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const NewVersion = "timetable.xlsx";
const PreviosVersion = "previous.xlsx";

const TeacherFormats = [
  ["?міртай Э. Т.", "Әміртай Э. Т."],
  ["К", "Куратор"],
  ["С?лтан Р. М.", "Сұлтан Р. М."],
  ["У", "Учитель"],
  ["У?лихан А.", "Уәлихан А."],
];

const OfficeFormats = [
  ["МСЗ", "Малый Спорт Зал"],
  ["СЗ", "Спорт Зал"],
];

const NameFormats = [
  ["Русский язык и литература", "Русский"],
  ["Русская литература", "Русская литература"],
  ["Русский язык", "Русский"],
  ["Казахский язык", "Казахский"],
  ["Казахская литература", "Казахская литература"],
  ["Казахский язык и литература", "Казахский"],
  ["Английский язык", "Английский"],
  ["Мат PISA", "Математика PISA"],
  ["Каз PISA", "Казахский PISA"],
  ["Рус PISA", "Русский PISA"],
  ["Физика ВСО/PISA", "Физика ВСО"],
  ["Казахский язык ВСО", "Казахский ВСО"],
  ["Информатика ВСО/PISA", "Информатика ВСО"],
  ["Химия ВСО/PISA", "Химия ВСО"],
  ["Биология ВСО/PISA", "Биология ВСО"],
  ["Русский язык ВСО", "Русский ВСО"],
  ["Химия(Углубленная)", "Химия"],
  ["Биология(Углубленная)", "Биология"],
  ["Информатика(Углубленная)", "Информатика"],
  ["Физика(Углубленная)", "Физика"],
  ["География(Стандартная)", "География"],
  ["Экономика(Стандартная)", "Экономика"],
  ["Графика и проектирование(Стандартная)", "ГИП"],
  ["Математика(7)", "Математика"],
  ["Математика(10)", "Математика (10)"],
  ["Програм.", "Программирование"],
  ["История Казахстана (Казахстан в современном мире)", "КСМ"],
  ["Физика Доп.", "Физика Доп"],
  ["Физическая культура", "Физ-ра"],
  ["Глобальные перспективы и проектные работы", "GPPW"],
  ["Начальная военная и технологическая подготовка", "НВП"],
  ["Человек. Общество. Право (Основы права)", "Основы Права"],
];

const NameFilter = ["/PISA", "(Углубленная)", "(Стандартная)"];

const WeekDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function FormatTeacher(str) {
  for (let index = 0; index < TeacherFormats.length; index++) {
    if (TeacherFormats[index][0] == str) {
      return TeacherFormats[index][1];
    }
  }
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.replace(word[0], word[0].toUpperCase());
    })
    .join(" ");
}

function FormatTime(str) {
  return "00:" + str;
}

function FormatOffice(str) {
  for (let index = 0; index < OfficeFormats.length; index++) {
    if (OfficeFormats[index][0] == str) {
      return OfficeFormats[index][1];
    }
  }
  return str;
}

function FormatName(str) {
  for (let index = 0; index < NameFormats.length; index++) {
    if (NameFormats[index][0] == str) {
      return NameFormats[index][1];
    }
  }

  for (let index = 0; index < NameFilter.length; index++) {
    if (str.endsWith(NameFilter[index])) {
      return str.slice(0, str.length - NameFilter[index].length);
    }
  }

  return str;
}

function FormatDay(str) {
  const date = new Date(str);
  return WeekDays[date.getDay()];
}

function FormatGroups(str) {
  if (str != "") {
    if (str.includes("Подгруппа")) {
      return [str.charAt(0)];
    } else {
      return [""];
    }
  } else {
    return ["1", "2"];
  }
}

function FormatProfile(str) {
  if (str != "") {
    if (!str.includes("Подгруппа")) {
      return str;
    } else {
      return "";
    }
  } else {
    return "";
  }
}

function GetNameInTable(Table, ID) {
  for (let j = 0; j < Table.length; j++) {
    if (Table[j].id == ID) {
      return Table[j].name;
    }
  }
}

function GetShortInTable(Table, ID) {
  for (let j = 0; j < Table.length; j++) {
    if (Table[j].id == ID) {
      return Table[j].short;
    }
  }
}

function GetStartOfThisWeek() {
  let date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1);
  date.setHours(23, 59, 59);
  return date.toISOString().slice(0, 10).replace("T", " ");
}

function GetEndOfThisWeek() {
  let date = new Date();
  date.setDate(date.getDate() - date.getDay() + (date.getDay() ? 7 : 0));
  date.setHours(23, 59, 59);
  return date.toISOString().slice(0, 10).replace("T", " ");
}

function GetDatabase() {
  return Axios({
    method: "POST",
    url: "https://fmalmnis.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor",
    data: {
      __args: [
        "null",
        2021,
        {
          vt_filter: {
            datefrom: GetStartOfThisWeek(),
            dateto: GetEndOfThisWeek(),
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

function GetTimetableOfClass(ID) {
  return Axios({
    url: "https://fmalmnis.edupage.org/timetable/server/currenttt.js?__func=curentttGetData",
    method: "POST",
    data: {
      __args: [
        null,
        {
          year: 2021,
          datefrom: GetStartOfThisWeek(),
          dateto: GetEndOfThisWeek(),
          table: "classes",
          id: ID,
          showOrig: true,
          log_module: "CurrentTTView",
        },
      ],
      __gsh: "00000000",
    },
  });
}

async function Bootstrap(file) {
  GetDatabase().then((response) => {
    const TeacherTable = response.data.r.tables[0].data_rows;
    const SubjectTable = response.data.r.tables[1].data_rows;
    const OfficeTable = response.data.r.tables[2].data_rows;
    const ClassTable = response.data.r.tables[3].data_rows;
    const PeriodTable = response.data.r.tables[4].data_rows;

    let ClassPromises = Array();
    let ClassNames = Array();

    ClassTable.map(function (ClassObject) {
      ClassPromises.push(GetTimetableOfClass(ClassObject.id));
      ClassNames.push(GetNameInTable(ClassTable, ClassObject.id));
    });

    Promise.all(ClassPromises).then(async function (Timetables) {
      const Workbook = new ExcelJS.Workbook();
      const Worksheet = Workbook.addWorksheet("Sheet");

      for (let index = 0; index < Timetables.length; index++) {
        const ClassGrade = ClassNames[index].slice(
          0,
          ClassNames[index].length - 1
        );
        const ClassLetter = ClassNames[index].charAt(
          ClassNames[index].length - 1
        );

        Timetables[index].data.r.ttitems.map(function (Lesson) {
          const SubjectName = FormatName(
            GetNameInTable(SubjectTable, Lesson.subjectid)
          );
          const SubjectTeacher = FormatTeacher(
            GetShortInTable(TeacherTable, Lesson.teacherids[0])
          );
          const SubjectOffice = FormatOffice(
            GetShortInTable(OfficeTable, Lesson.classroomids[0])
          );
          const SubjectDuration =
            Lesson.durationperiods === undefined ? 1 : Lesson.durationperiods;
          const SubjectDay = FormatDay(Lesson.date);
          const SubjectGroups =
            SubjectName != "Математика (10)"
              ? FormatGroups(Lesson.groupnames[0])
              : [""];

          let SubjectProfile;

          if (ClassGrade == "11" || ClassGrade == "12") {
            SubjectProfile = FormatProfile(Lesson.groupnames[0]);
          } else {
            SubjectProfile = "";
          }

          for (
            let period = +Lesson.uniperiod - 1;
            period < +Lesson.uniperiod - 1 + SubjectDuration;
            period++
          ) {
            SubjectGroups.map(function (SubjectGroup) {
              Worksheet.addRow([
                FormatTime(PeriodTable[period].starttime),
                FormatTime(PeriodTable[period].endtime),
                SubjectName,
                SubjectTeacher,
                SubjectOffice,
                ClassGrade,
                ClassLetter,
                SubjectDay,
                SubjectGroup,
                SubjectProfile,
              ]).commit();
            });
          }
        });
      }
      await Workbook.xlsx.writeFile(file);
    });
  });
}

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

Cron.schedule("* * * * *", async () => {
  fs.unlink(PreviosVersion, (error) => {
    if (error && error.errno != -4058) {
      SendToTelegram(error);
    }
  });
  
  fs.rename(NewVersion, PreviosVersion, (error) => {
    if (error && error.errno != -4058) {
      SendToTelegram(error);
    }
  })
  
  await Bootstrap(NewVersion);
  
  let changed = await CheckForChange(NewVersion, PreviosVersion);
  console.log(changed);
  
  // if (changed) {
  //   UploadFile(NewVersion);
  //   SendToTelegram("Timetable changed and uploaded to the server!");
  // } else {
  //   SendToTelegram("Timetable did not change, current version is okay!");
  // }
});
