const path = require('path');
const fs = require('fs');
const solc = require('solc');

//nos proporciona el path a los archivos que necesitamos
const DataBasePath = path.resolve(__dirname,'contracts','DataBase.sol');
const source = fs.readFileSync(DataBasePath,'utf8');

module.exports = solc.compile(source,1).contracts[':DataBase'];
