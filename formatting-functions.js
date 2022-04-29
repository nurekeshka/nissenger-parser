const constants = require("./constants.js");

module.exports = {
  formatTeacher(str) {
    for (let index = 0; index < constants.teacherFormats.length; index++) {
      if (constants.teacherFormats[index][0] == str) {
        return constants.teacherFormats[index][1];
      }
    }
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(" ");
  },

  formatTime(str) {
    return "00:" + str;
  },

  formatOffice(str) {
    for (let index = 0; index < constants.officeFormats.length; index++) {
      if (constants.officeFormats[index][0] == str) {
        return constants.officeFormats[index][1];
      }
    }
    return str;
  },

  formatName(str) {
    for (let index = 0; index < constants.nameFormats.length; index++) {
      if (constants.nameFormats[index][0] == str) {
        return constants.nameFormats[index][1];
      }
    }

    for (let index = 0; index < constants.nameFilter.length; index++) {
      if (str.endsWith(constants.nameFilter[index])) {
        return str.slice(0, str.length - constants.nameFilter[index].length);
      }
    }

    return str;
  },

  formatDay(str) {
    const date = new Date(str);
    return constants.weekDays[date.getDay()];
  },

  formatGroups(str) {
    if (str != "") {
      if (str.includes("Подгруппа")) {
        return [str.charAt(0)];
      } else {
        return [""];
      }
    } else {
      return ["1", "2"];
    }
  },

  formatProfile(str) {
    if (str != "") {
      if (!str.includes("Подгруппа")) {
        return str;
      } else {
        return "";
      }
    } else {
      return "";
    }
  },
};
