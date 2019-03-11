const path = require('path');
const fs = require('fs');
const solc = require('solc');

//nos proporciona el path a los archivos que necesitamos
const ServerPath = path.resolve(__dirname,'contracts','Server.sol');
const source = fs.readFileSync(ServerPath,'utf8');

module.exports = solc.compile(source,1).contracts[':Server'];
