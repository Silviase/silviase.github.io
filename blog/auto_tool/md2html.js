const program = require('commander');
const fs = require('fs');
const marked = require('marked');

program.parse(process.argv);

const path = require('path');
const html_head = fs.readFileSync(path.resolve(__dirname, 'head.txt'), 'utf8');
const html_body = marked(fs.readFileSync(program.args[0], 'utf8'));
const html_foot = fs.readFileSync(path.resolve(__dirname, 'foot.txt'), 'utf8');

fs.writeFileSync(program.args[1], html_head);
fs.appendFileSync(program.args[1], html_body);
fs.appendFileSync(program.args[1], html_foot);
