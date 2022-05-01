# Bit handling utilities for data compression

```js

var bitsUtils = require("bits-utils");
let buffer = new Uint8Array(1);
bitsUtils.setBit(buffer, 0, 0, 1)
bitsUtils.setBit(buffer, 0, 1, 0)
bitsUtils.setBit(buffer, 0, 2, 1)

console.log(
    bitsUtils.readBit(buffer, 0, 0),  bitsUtils.readBit(buffer, 0, 1),  bitsUtils.readBit(buffer, 0, 2)
);

```

```js
console.log(countDistinctSymbols('AAAA B C D D D D').map((el,index) => {return {symbol: String.fromCharCode(index), count: el}}));
```

## Which process listenes to port 4200
```bash
netstat -ano | findStr "4200"
```


## Kill a specific PID
```bash
Taskkill /PID 25740 /F
```

git config --global --add url."git@github.com:".insteadOf "https://github.com/"
