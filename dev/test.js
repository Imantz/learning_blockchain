const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const previousBlockHash = "OINK";
const currentBlockData = [
  {
    amount: 10,
    sender: "LALAMON",
    recipient: "Bubub",
  },
  {
    amount: 30,
    sender: "ASD",
    recipient: "DSSDD",
  },
  {
    amount: 220,
    sender: "GKDLF",
    recipient: "KDLSKD",
  },
];

const nonce = 100;

bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce));
