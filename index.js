let fs = require('fs');
// sending buffer by reference is not a good practice
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
}

function getSymbolsBitCodes(alphabet, numBits) {
  let codesHash = new Map();
  for(let i=0;i<alphabet.length;i++) {
    codesHash.set(alphabet[i].symbol, (i).toString(2).padStart(numBits, '0'));
  }
  return codesHash;
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
      let code = codes.get(symbol);
      for(let j=0;j<code.length;j++){
        setBit(binaryData, bufferIndex, bitIndex, parseInt(code[j]));
        bitIndex++;
        if(bitIndex === 8) {
          bitIndex = 0;
          bufferIndex++;
        }

      }
  }
  const unusedBits = totalBits - dataBits;

  return { binaryData, codes, numberOf8BitChunks, codeLengthInBits, totalBits, dataBits, unusedBits  };
}

function getSymbolForCode(codes, code) {
  return Object.keys(codes).find(key => codes[key] === val);
  for (let i=0;i<codes.length;i++) {
    if (codes[i].c === code) {
      return codes[i].s;
    }
  }
  return null;
}

function decompress(compressed) {
  let result = '';

  const invertedCodes = new Map([...compressed.codes.entries()].map(
      ([key, value]) => ([value, key]))
  );

  let bufferIndex = 0;
  let bitIndex = 0;
  let currentCode ='';
  for (let i=0;i<compressed.dataBits;i++) {
    currentCode += readBit(compressed.binaryData, bufferIndex, bitIndex);

    if (currentCode.length === compressed.codeLengthInBits){
      result += invertedCodes.get(currentCode)

      currentCode = '';
    }

    bitIndex++;
    if(bitIndex === 8) {
      bitIndex = 0;
      bufferIndex++;
    }

  }
  return result;

}

function getSymbolCode(symbol, codes) {
  console.log(codes.get(symbol));
  for(let i=0;i<codes.length;i++) {
    if (symbol === codes[i].symbol) return codes[i].code;
  }
  return null;
}

function getChunk(buffers, index) {
  let bits = '';
  for (let i=0;i<8;i++) {
    bits += readBit(buffers, index, i);
  }
  return bits;
}

function printBuffer(buffers) {
  let result = '';
  for (let i =0; i<buffers.length;i++) {
    result += getChunk(buffers, i);
  }
  return result;
}

function compressUsingFixedCodes(data) {
  const symbols = countASCIISymbols(data);
  const alphabet = getAlphabet(symbols);
  const codeLength = getFixedCodeLengthInBits(symbols);
  const codes = getSymbolsBitCodes(alphabet, codeLength)
  return compress(data, codes, codeLength);
}

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
  loadTextFile,
  compressUsingFixedCodes
};
