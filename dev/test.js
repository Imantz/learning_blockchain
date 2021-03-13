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

bitcoin.hashBlock(previousBlockHash, currentBlockData, 64126);
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, 64126));
let a = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
console.log(a);
