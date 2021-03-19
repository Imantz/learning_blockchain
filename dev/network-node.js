const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid");
const axios = require("axios");

const PORT = process.argv[2];
const nodeAddress = uuid.v1().split("-").join("");
const bitcoin = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "false" }));

app.get("/blockchain", function (req, res) {
  res.send(bitcoin);
});

app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(
    newTransaction
  );
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post("/transaction/broadcast", function (req, res) {
  const newTransaction = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  bitcoin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    requestPromises.push(
      axios.post(networkNodeUrl + "/transaction", newTransaction)
    );
  });

  Promise.all(requestPromises).then((_) => {
    res.json({ note: "Transaction created and broadcast successfully" });
  });
});

app.get("/mine", function (req, res) {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    requestPromises.push(
      axios.post(networkNodeUrl + "/receive-new-block", { newBlock })
    );
  });

  Promise.all(requestPromises)
    .then(() =>
      axios.post(bitcoin.currentNodeUrl + "/transaction/broadcast", {
        amount: 12.5,
        sender: "00",
        recipient: nodeAddress,
      })
    )
    .then(() =>
      res.json({
        node: "New block mined & broadcast successfully",
        block: newBlock,
      })
    );
});

app.post("/receive-new-block", function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = bitcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({
      note: "New block received and accepted",
      newBlock,
    });
  } else {
    res.json({
      note: "New block rejected",
      newBlock,
    });
  }
});

app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    regNodesPromises.push(
      axios.post(networkNodeUrl + "/register-node", { newNodeUrl })
    );
  });

  Promise.all(regNodesPromises)
    .then(() => {
      axios.post(newNodeUrl + "/register-nodes-bulk", {
        allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
      });
    })
    .then(() => {
      res.json({ note: "New node registered with network succesfully." });
    });
});

app.post("/register-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: "new node registered successfully with node" });
});

app.post("/register-nodes-bulk", function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      bitcoin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ note: "Bulk registration succesful" });
});

app.get("/consensus", function (req, res) {
  requestPromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    requestPromises.push(axios.get(networkNodeUrl + "/blockchain"));
  });

  Promise.all(requestPromises).then((blockchains) => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "current chain has not been replaced",
        chain: bitcoin.chain,
      });
    } else {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: "This chain has been replaced",
        chain: bitcoin.chain,
      });
    }
  });
});

app.get("/block/:blockHash", function (req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

app.get("/transaction/:transactionId", function (req, res) {
  const transactionId = req.params.transactionId;
  bitcoin.getTransaction(transactionId);
  const transactionData = bitcoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transaction.block,
  });
});

app.get("/address/:address", function (req, res) {});

app.listen(PORT, function () {
  console.log("Listening on port " + PORT);
});
