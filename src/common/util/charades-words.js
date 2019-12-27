const https = require("https");
const fs = require("fs");

// TODO: make this a config thing and simplify paths
const CACHE_DIR  = "./local";
const DICT_FILE_PATH = CACHE_DIR + "/charades-words.txt";

let words = [];

const generateList = async () => new Promise((resolve, reject) => {
    let wordList = [];
    if (!fs.existsSync(CACHE_DIR)){
        fs.mkdirSync(CACHE_DIR);
    }
    if (fs.existsSync(DICT_FILE_PATH)) {
        wordList = fs.readFileSync(DICT_FILE_PATH);
        resolve(JSON.parse(wordList));
    } else {
        https.get("https://homegamesio.s3-us-west-1.amazonaws.com/words.txt", (res) => {
            res.on("data", (d) => {
                wordList = [ ...wordList, ...d.toString().split(/\r?\n/)];
            });
            res.on("end", () => {
                fs.writeFile(DICT_FILE_PATH, JSON.stringify(wordList), (err) => {
                    if (err) console.log(err);
                });
                resolve(wordList);
            });
        }).on("error", error => {
            reject(error);
        });
    }
});

const charadesWords = {

    init: async () => {
        if (words.length > 0) {
            return words;
        } else {
            words = await generateList();
            return words;
        }
    },
    
    length: async () => {
        const words = await charadesWords.init();
        return words.length;
    },

    get: async (index) => {
        const words = await charadesWords.init();
        return words[index];
    },

    random: async () => {
        const length = await charadesWords.length();
        return charadesWords.get(Math.floor(Math.random() * length));
    }
};

module.exports = charadesWords;