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
  const blockIndex = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );

  res.json({ note: `transaction will be added in block ${blockIndex}` });
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

  bitcoin.createNewTransaction(12.5, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    node: "New block mined successfully",
    block: newBlock,
  });
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
    .then((data) => {
      axios.post(newNodeUrl + "/register-nodes-bulk", {
        allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
      });
    })
    .then((data) => {
      res.json({ note: "New node registered with network succesfully." });
    });
});

app.post("/register-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
    res.json({ note: "new node registered successfully with node" });
  }
  res.json({ note: "already have" });
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

app.listen(PORT, function () {
  console.log("Listening on port " + PORT);
});
