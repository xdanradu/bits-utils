let fs = require('fs');
// sending buffer by reference is not good practice
function readBit(buffer, i, bit) {
  return (buffer[i] >> bit) % 2;
}

function setBit(buffer, i, bit, value) {
  if (value == 0) {
    buffer[i] &= ~(1 << bit);
  } else {
    buffer[i] |= 1 << bit;
  }
}

function countASCIISymbols(text) {
  let counter = Array(256).fill(0);

  for (let i = 0; i < text.length; i++) {
    counter[text[i].charCodeAt(0)]++;
  }

  return counter.map((el, index) => {
    return { symbol: String.fromCharCode(index), count: el };
  });
}

function getSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function loadTextFile(filename) {
  return fs.readFileSync(filename, {encoding:'utf8', flag:'r'});
}
prepareForCompression(loadTextFile('LICENSE.txt'));

function prepareForCompression(data) {
  console.log(
      `Initial file size using ASCII encoding on 8 bit: ${getSize(data.length * 8, 0)}`
  );
  const symbols = countASCIISymbols(data);
  const usedSymbols = 256 - symbols.filter(el => el.count === 0).length;
  console.log(`Only ${usedSymbols} from 256 ASCII characters are required for this text file`);

  let fixedCodeLength = usedSymbols.toString(2).length;
  console.log(
      `Fixed length codes compression on ${fixedCodeLength} bits can be used to compress the file to: 
      ${getSize(data.length * fixedCodeLength, 0)}  + ${getSize(usedSymbols * 8)} fixed codes`
  );

  const alphabet = symbols.filter(el => el.count > 0).sort((a, b) => b.count - a.count);
  // console.log(alphabet); //descending sort

  const totalNumberOfBits = data.length * fixedCodeLength;
  // console.log(`Before compression the file requires ${totalNumberOfBits * 8} space. After compression the file will be ${totalNumberOfBits * 5} bits long.`);
  // const numberOf8BitBuffers = ( usedSymbols * fixedCodeLength ) / 8;
  // console.log(numberOf8BitBuffers);
  const codes = getSymbolsBitCodes(alphabet);
  let compressed = compress(data, codes, fixedCodeLength);
  console.log(compressed);
}

function getSymbolsBitCodes(alphabet) {
  let codes = Array();
  for(let i=0;i<alphabet.length;i++) {
      codes.push({id: i, symbol: alphabet[i].symbol, code: (i).toString(2).padEnd(6, '0')})
  }
  return codes;
}

function compress(data, codes, codeLength) {
  const numberOf8BitBuffers = Math.ceil(( data.length * codeLength ) / 8 );
  let buffer = new Uint8Array(3);//numberOf8BitBuffers
  let bufferIndex = 0;
  let firstFour = true;
  for(let i=0; i<3;i++) {
      let symbol = data[i];
      let code = getSymbolCode(symbol, codes);
      for(let j=0;j<code.length;j++){
        if (firstFour) {
          console.log(bufferIndex);
          setBit(buffer, bufferIndex, j, parseInt(code[j]));
        } else {
          setBit(buffer, bufferIndex, 4+j, parseInt(code[j]))
        }
        firstFour = !firstFour;
      }
      if(i>2 && i%2) { bufferIndex ++ }
  }
  return buffer;
}

function getSymbolCode(symbol, codes) {
  for(let i=0;i<codes.length;i++){
    if (symbol === codes[i].symbol) return codes[i].code;
  }
  return null;
}

module.exports = {
  readBit,
  setBit,
  countASCIISymbols: countASCIISymbols,
  getSize
};
