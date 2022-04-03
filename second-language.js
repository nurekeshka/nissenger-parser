const axios = require("axios").default;
const cheerio = require("cheerio").default;
const { root } = require("cheerio");
const fs = require("fs");

async function LoadTimetableHTML() {
    try {
        return await axios({
            method: "GET",
            url: "https://fmalmnis.edupage.org/a/---2"
        });
    } catch (error) {
        console.log(error);
    }
}

function LoadFromFile(file) {
    return fs.readFileSync(file, "utf8");
}

function ParseTimetableHTML(HTML) {
    const $  = cheerio.load(HTML);
    $("table").each(function (table_index, table) {
        table("tbody > tr").each(function (row_index, row) {
            console.log(row);
        })
    });
}

async function Main() {
    // console.log(ParseTimetableHTML(await LoadTimetableHTML()));
    console.log(ParseTimetableHTML(LoadFromFile("foreign-language.html")))
}

Main();
