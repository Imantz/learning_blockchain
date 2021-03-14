const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid");
const rp = require("request");

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

app.get("/transaction", function (req, res) {
  const blockIndex = bitcoin.createNewTransaction(
    req.query.amount,
    req.query.sender,
    req.query.recipient
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
  const reqNodesPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: {
        newNodeUrl,
      },
      json: true,
    };

    reqNodesPromises.push(rp(requestOptions));
  });

  Promise.all(reqNodesPromises)
    .then((data) => {
      const bulkRegisterOprions = {
        uri: newNodeUrl + "register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
        },
        json: true,
      };

      rp(bulkRegisterOprions);
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
});

app.post("/register-nodes-bulk", function (req, res) {});
app.listen(PORT, function () {
  console.log("Listening on port " + PORT);
});
