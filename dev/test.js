const Blockchain = require("./blockchain");

const pokemonCoin = new Blockchain();

pokemonCoin.createNewBlock(2390, "HASH", "ANOTHERHASH");
pokemonCoin.createNewBlock(123, "ASD", "CCCUC");
pokemonCoin.createNewBlock(32, "BUBUB", "JAS");

console.log(pokemonCoin);
