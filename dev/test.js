const Blockchain = require("./blockchain");

const pokemonCoin = new Blockchain();

pokemonCoin.createNewBlock(2390, "HASH", "ANOTHERHASH");
pokemonCoin.createNewTransaction(100, "ALF", "BUBU");
pokemonCoin.createNewBlock(123, "5435", "ASDE@!#");
pokemonCoin.createNewTransaction(100, "ALF", "BUBU");
pokemonCoin.createNewTransaction(300, "ALF", "BUBU");
pokemonCoin.createNewTransaction(2000, "ALF", "BUBU");
pokemonCoin.createNewBlock(132323, "ASDASD435", "GERKJGER");

console.log(pokemonCoin);
