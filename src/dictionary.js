const https = require("https");
const generateList = async () => new Promise((resolve, reject) => {
    let wordList = [];
    https.get("https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt", (res) => {
        res.on("data", (d) => {
            wordList = [ ...wordList, ...d.toString().split(/\r?\n/)];
        });
        res.on("end", () => {
            resolve(wordList);
        });
    }).on("error", error => {
        reject(error);
    });
});
module.exports = generateList;
