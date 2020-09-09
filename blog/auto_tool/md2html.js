const program = require("commander");
const fs = require("fs");
const marked = require("marked");

program.parse(process.argv);
const path = program.args[0];

fs.readFile(path, {encoding: "utf8"}, (err, file) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
        return;
    }

    const html = marked(file);
    console.log(html);
});