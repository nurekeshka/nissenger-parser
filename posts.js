const axios = require("axios");
const fs = require("fs");
const FormData = require('form-data');

function upload(filename) {
  const form_data = new FormData();
  form_data.append("file", fs.createReadStream(filename));

  axios({
    method: "POST",
    url: "https://api.nissenger.com/timetables/upload-timetable",
    data: {
      form_data,
    },
  }).then(function (response) {
    console.log(response);
  }).catch(function (err) {
      console.log(err);
  });
}

upload("timetable.xlsx");
