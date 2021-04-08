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
    return { id: index, symbol: String.fromCharCode(index), count: el };
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

function getFixedCodeLengthInBits(asciiCounter) {
  const usedSymbols = asciiCounter.filter(el => el.count > 0).length;
  return usedSymbols.toString(2).length;
}
function getAlphabet(symbols) {
  return symbols.filter(el => el.count > 0).sort((a, b) => b.count - a.count);
};

/*
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
  const codes = getSymbolsBitCodes(alphabet, fixedCodeLength);
  let compressed = compress(data, codes, fixedCodeLength);
  // console.log(compressed);
  // const reducer = (accumulator, currentValue) => accumulator + currentValue.code;
  // console.log(codes.reduce(reducer));
  // console.log(codes.filter(el => el.symbol === 'A')[0].code+codes.filter(el => el.symbol === ' ')[0].code);
  // printBuffer(compressed.binaryData);
  console.log(compressed);
return compressed;

}
 */

function getSymbolsBitCodes(alphabet, numBits) {
  let codes = Array();
  for(let i=0;i<alphabet.length;i++) {
      codes.push({id: i, symbol: alphabet[i].symbol, code: (i).toString(2).padStart(numBits, '0'), count: alphabet[i].count})
  }
  return codes;
}

function compress(data, codes, codeLengthInBits) {
  const dataBits = data.length * codeLengthInBits;
  const numberOf8BitChunks = Math.ceil(dataBits / 8 );
  const totalBits = numberOf8BitChunks * 8;
  let binaryData = new Uint8Array(numberOf8BitChunks);
  let bufferIndex = 0;
  let bitIndex = 0;
  for(let i=0; i<data.length;i++) {
      let symbol = data[i];
      let code = getSymbolCode(symbol, codes);
      // console.log(symbol + ':' + code);
      for(let j=0;j<code.length;j++){
        setBit(binaryData, bufferIndex, bitIndex, parseInt(code[j]));

        if(bitIndex === 7) {
          bitIndex = 0;
          bufferIndex++;
        }
        bitIndex++;
      }
  }
  const unusedBits = totalBits - dataBits;
  return { binaryData, codes, numberOf8BitChunks, codeLengthInBits, totalBits, dataBits, unusedBits  };
}

function getSymbolForCode(codes, code) {
  for (let i=0;i<codes.length;i++) {
    if (codes[i].code === code) {
      return codes[i].symbol;
    }
  }
  return null;
}

function decompress(compressed) {
  let result = '';

  let bufferIndex = 0;
  let bitIndex = 0;
  let currentCode ='';
  for (let i=0;i<compressed.dataBits;i++) {
    currentCode += readBit(compressed.binaryData, bufferIndex, bitIndex);

    if (currentCode.length === compressed.codeLengthInBits){
      // console.log(currentCode)
      result += getSymbolForCode(compressed.codes, currentCode);

      currentCode = '';
    }

    if(bitIndex === 7) {
      bitIndex = 0;
      bufferIndex++;
    }
    bitIndex++;
  }

  console.log(result);
  return result;

}


function getSymbolCode(symbol, codes) {
  for(let i=0;i<codes.length;i++){
    if (symbol === codes[i].symbol) return codes[i].code;
  }
  return null;
}

function getChunk(buffers, index) {
  let bits = '';
  for (let i=0;i<8;i++) {
    bits+=readBit(buffers, index, i);
  }
  return bits;
}

function printBuffer(buffers) {
  let result = '';
  for (let i =0; i<buffers.length;i++) {
    result += getChunk(buffers, i);
    result += (buffers.length>0 && i < buffers.length - 1? ' ': '');
  }
  return result;
}


/*
function test() {
  let buffers = new Uint8Array(1);
  setBit(buffers, 0, 0, 1)
  setBit(buffers, 0, 1, 0)
  setBit(buffers, 0, 2, 1)

  console.log(
      readBit(buffers, 0, 0),  readBit(buffers, 0, 1),  readBit(buffers, 0, 2)
  );
  console.log(getBits(buffers, 0));

}

 */



module.exports = {
  readBit,
  setBit,
  countASCIISymbols,
  getSize,
  printBuffer,
  getChunk,
  compress,
  getSymbolCode,
  getSymbolsBitCodes,
  getAlphabet,
  getFixedCodeLengthInBits,
  decompress,
  loadTextFile
};
