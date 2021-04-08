const chalk = require('chalk');

function isEqual(name, a, b) {
    console.log(`${chalk.blue(name)} ${a === b?chalk.green('Passed'):chalk.red('Failed')}`);
}

module.exports = {
    isEqual
};
