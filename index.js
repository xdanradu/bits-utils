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

function countDistinctASCIISymbols(text) {
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

module.exports = {
  readBit,
  setBit,
  countDistinctASCIISymbols,
  getSize
};
