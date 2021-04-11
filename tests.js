const chalk = require('chalk');
const assert = require('./tests/assert');
const lib = require('./index');

function runTests() {
    console.log(chalk.cyanBright('Running all tests'));

    console.log(chalk.whiteBright('\ngetSymbolCode'));
    let codes = [ { symbol: ' ', code: '00001001' } , { symbol: 'A', code: '10001001'} ];
    assert.isEqual('1 getSymbolCode\t\t\t', lib.getSymbolCode('A', codes), '10001001');
    assert.isEqual('2 getSymbolCode\t\t\t', lib.getSymbolCode(' ', codes), '00001001');
    assert.isEqual('3 getSymbolCode\t\t\t', lib.getSymbolCode('B', codes), null);


    let buffers = new Uint8Array(3);
    lib.setBit(buffers, 0, 2, 1);
    lib.setBit(buffers, 1, 5, 1);
    lib.setBit(buffers, 2, 7, 1);

    console.log(chalk.whiteBright('\ngetChunk'));
    assert.isEqual('1 getBits\t\t\t', lib.getChunk(buffers, 0), '00100000');

    console.log(chalk.whiteBright('\nprintBuffer'));
    assert.isEqual('1 printBuffer\t\t\t', lib.printBuffer(buffers), '00100000 00000100 00000001');

    console.log(chalk.whiteBright('\ncountASCIISymbols'));
    assert.isEqual('1 countASCIISymbols\t\t', lib.countASCIISymbols('ABAC D D D E+').length, 256);
    assert.isEqual('2 countASCIISymbols\t\t', lib.countASCIISymbols('ABAC D D D E+')[68].count, 3);

    console.log(chalk.whiteBright('\ngetAlphabet'));
    const data = 'ABAC D D D E+';
    const counter = lib.countASCIISymbols(data);
    assert.isEqual('1 getAlphabet\t\t\t', lib.getAlphabet(counter).length, 7);
    assert.isEqual('2 getAlphabet\t\t\t', lib.getAlphabet(counter).reduce((a, b) => a + b.count, 0), 13);

    console.log(chalk.whiteBright('\ngetFixedCodeLengthInBits'));
    const codesLength = lib.getFixedCodeLengthInBits(counter);
    assert.isEqual('1 getFixedCodeLengthInBits \t', codesLength, 3);

    console.log(chalk.whiteBright('\ngetSymbolsBitCodes'));
    let alphabet = lib.getAlphabet(counter);
    assert.isEqual('1 getSymbolsBitCodes\t\t', lib.getSymbolsBitCodes(alphabet, codesLength)[0].code, '000');
    assert.isEqual('2 getSymbolsBitCodes\t\t', lib.getSymbolsBitCodes(alphabet, codesLength)[0].count, 4);
    assert.isEqual('3 getSymbolsBitCodes\t\t', lib.getSymbolsBitCodes(alphabet, codesLength)[6].code, '110');
    assert.isEqual('4 getSymbolsBitCodes\t\t', lib.getSymbolsBitCodes(alphabet, codesLength)[1].count, 3);
    assert.isEqual('5 getSymbolsBitCodes\t\t', lib.getSymbolsBitCodes(alphabet, codesLength)[5].code, '101');

    console.log(chalk.whiteBright('\ncompress'));
    let dataCodes = lib.getSymbolsBitCodes(alphabet, codesLength);
    let compressed = lib.compress(data, dataCodes, codesLength);
    console.log(compressed.codes);
    assert.isEqual('1 compress\t\t\t', compressed.binaryData[0], 138);

    console.log(chalk.whiteBright('\ndecompress'));
    const decompressed = lib.decompress(compressed);
    assert.isEqual('1 decompress\t\t\t', decompressed, data);

    const dt = 'ABCD';
    const cnt = lib.countASCIISymbols(dt);
    const alph = lib.getAlphabet(cnt);
    const codesLen = lib.getFixedCodeLengthInBits(cnt);
    const cods = lib.getSymbolsBitCodes(alph, codesLength)
    const cmp = lib.compress(dt, cods, codesLen);
    const dec = lib.decompress(cmp);
    assert.isEqual('2 decompress\t\t\t', dec, dt);

    const bigText = lib.loadTextFile('LICENSE.txt');
    const shrunk = lib.compressUsingFixedCodes(bigText);
    const unzipped = lib.decompress(shrunk);
    assert.isEqual('3 decompress\t\t\t', unzipped, bigText);
}

runTests();
