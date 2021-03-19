const Blockchain = require("./blockchain");
const axios = require("axios");
const bitcoin = new Blockchain();

const registerNodes = () => {
  axios
    .post("http://localhost:3001/register-and-broadcast-node", {
      newNodeUrl: "http://localhost:3002",
    })
    .catch((e) => console.log(e?.response?.data));
  axios
    .post("http://localhost:3001/register-and-broadcast-node", {
      newNodeUrl: "http://localhost:3003",
    })
    .catch((e) => console.log(e?.response?.data));
  axios
    .post("http://localhost:3001/register-and-broadcast-node", {
      newNodeUrl: "http://localhost:3004",
    })
    .catch((e) => console.log(e?.response?.data));
  axios
    .post("http://localhost:3001/register-and-broadcast-node", {
      newNodeUrl: "http://localhost:3005",
    })
    .catch((e) => console.log(e?.response?.data));
};

const broadcastTransactions = () => {
  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 100,
      sender: "FIRSTBROADTRANSACTION",
      recipient: "FROMFIRSTBROADTRANSACTION",
    })
    .catch((e) => console.log(e?.response?.data));
  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 200,
      sender: "SECONDBROADTRANSACTION",
      recipient: "FROMSECONDBROADTRANSACTION",
    })
    .catch((e) => console.log(e?.response?.data));

  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 500,
      sender: "SECONDBROADTRANSACTION",
      recipient: "FROMSECONDBROADTRANSACTION",
    })
    .catch((e) => console.log(e?.response?.data));
};

const mineTwoBlocks = () => {
  axios.get("http://localhost:3004/mine");
  axios.get("http://localhost:3005/mine");
};

const mine3004block = () => {
  axios.get("http://localhost:3004/mine");
};

const moreTransactions = () => {
  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 1000,
      sender: "BUBULIS",
      recipient: "FIRSTBROADTRANSACTION",
    })
    .catch((e) => console.log(e?.response?.data));

  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 30,
      sender: "FIRSTBROADTRANSACTION",
      recipient: "RANDOMASD",
    })
    .catch((e) => console.log(e?.response?.data));

  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 40.65,
      sender: "FIRSTBROADTRANSACTION",
      recipient: "RANDOMASD",
    })
    .catch((e) => console.log(e?.response?.data));
};

const mine3001block = () => {
  axios.get("http://localhost:3001/mine");
};

const coupleOfMoreTransactions = () => {
  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 400,
      sender: "ASDASDA",
      recipient: "BUBULIS",
    })
    .catch((e) => console.log(e?.response?.data));

  axios
    .post("http://localhost:3002/transaction/broadcast", {
      amount: 120,
      sender: "ASDASDA",
      recipient: "BUBULIS",
    })
    .catch((e) => console.log(e?.response?.data));
};

const main = () => {
  setTimeout(registerNodes, 500);
  setTimeout(mineTwoBlocks, 700);
  setTimeout(broadcastTransactions, 900);
  setTimeout(mine3004block, 1100);
  setTimeout(moreTransactions, 1300);
  setTimeout(mine3001block, 1500);
  setTimeout(coupleOfMoreTransactions, 1700);
  setTimeout(mine3001block, 1900);
  setTimeout(mine3004block, 2100);
  setTimeout(() => {
    axios.get("http://localhost:3002/blockchain").then((r) => {
      console.log(r.data);

      console.log("-----------");
      console.log("chain is valid? : ", bitcoin.chainIsValid(r.data.chain));
      console.log("chain length : ", r.data.chain.length);
    });
  }, 2500);
};

//2 sec after nodemon start nodes
setTimeout(main, 2000);
