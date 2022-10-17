const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const Blockchain = require("./blockchain");
const app = express();
const ripple = new Blockchain();
const PORT = process.argv[2];
const RP = require("request-promise");
const { json } = require("body-parser");

const rewardReceiver = uuid.v4().split("-").join("");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.send("Hello.. Welcome to Blockchain in Javascript");
});

// Get Existing Blockchain
app.get("/blockchain", function (req, res) {
  res.send(ripple);
});

// Create New Transaction
app.post("/transaction", function (req, res) {
  const nullCheck =
    req.body.amount == null &&
    req.body.sender == null &&
    req.body.receiver == null;
  const newTransaction = req.body;
  const blockIndex =
    ripple.broadcastTransactionToPendingTransactions(newTransaction);
  nullCheck
    ? res.json({ error: `Some elements are null not allowed.` })
    : res.json({
        note: `This Transaction will be added in Block no ${blockIndex}.`,
      });
});

// Broadcast Transaction
app.post("/transaction-broadcast", function (req, res) {
  const newTransaction = ripple.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.receiver
  );
  ripple.broadcastTransactionToPendingTransactions(newTransaction);

  const requestOptions = [];
  ripple.networkNodes.forEach((nodeUrl) => {
    const reqOptions = {
      uri: nodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };
    requestOptions.push(RP(reqOptions));
  });

  Promise.all(requestOptions).then((data) => {
    res.json({ note: "Transaction broadcast done successfully." });
  });
});

//Create New Block or Mine a Block
app.get("/mine", function (req, res) {
  const lastBlock = ripple.getLastBlock();
  if (ripple.pendingTransactions.length == 0) {
    res.json({
      warning: "No Pending Transactions found to Mine",
    });
    return;
  }

  let reward = 0;
  for (let i = 0; i < ripple.pendingTransactions.length; i++) {
    reward += ripple.pendingTransactions[i].amount;
  }

  reward = (reward * 6.25) / 100;
  const newTransaction = ripple.createNewTransaction(
    reward,
    "00RIPREWARDSYSTEM",
    rewardReceiver
  );

  const currentBlockdata = {
    index: lastBlock.index + 1,
    transactions: ripple.pendingTransactions,
  };
  const nonce = ripple.proofOfWork(lastBlock.hash, currentBlockdata);
  const blockHash = ripple.hashBlock(lastBlock.hash, nonce, currentBlockdata);

  const newBlock = ripple.createNewBlock(nonce, lastBlock.hash, blockHash);
  const reqPromises = [];
  ripple.networkNodes.forEach((nodeUrl) => {
    const reqOptions = {
      uri: nodeUrl + "/receive-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true,
    };

    reqPromises.push(RP(reqOptions));
  });

  Promise.all(reqPromises)
    .then((data) => {
      const reqOptions = {
        uri: ripple.currentNodeUrl + "/transaction-broadcast",
        method: "POST",
        body: {
          amount: reward,
          sender: "00RIPREWARDSYSTEM",
          receiver: rewardReceiver,
        },
        json: true,
      };

      return RP(reqOptions);
    })
    .then((data) => {
      res.json({
        note: "New Block is Mined and Broadcasted Successfully.",
        block: newBlock,
      });
    });
});

app.post("/receive-block", function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = ripple.getLastBlock();
  const isBlockValid =
    lastBlock.hash === newBlock.previousBlockHash &&
    lastBlock.index + 1 === newBlock.index;
  if (isBlockValid) {
    ripple.chain.push(newBlock);
    ripple.pendingTransactions = [];
    res.json({ note: "Block received successfully.", newBlock: newBlock });
  } else {
    res.json({ note: "New Block Rejected.", newBlock: newBlock });
  }
});

// To register and Broadcast new node in our list of nodes.
app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (ripple.networkNodes.indexOf(newNodeUrl) == -1) {
    ripple.networkNodes.push(newNodeUrl);
  }
  const requestPromises = [];
  ripple.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };
    requestPromises.push(RP(requestOptions));
  });
  Promise.all(requestPromises)
    .then((data) => {
      const registerBulkOptions = {
        uri: newNodeUrl + "/register-bulk-nodes",
        method: "POST",
        body: {
          allNetworkNodes: [...ripple.networkNodes, ripple.currentNodeUrl],
        },
        json: true,
      };
      return RP(registerBulkOptions);
    })
    .then((data) => {
      res.json({ note: "New node is registered wih our network successfully" });
    });
});

// To register node on each present node in our list of nodes.
app.post("/register-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const newtowrkNodesCheck = ripple.networkNodes.indexOf(newNodeUrl) == -1;
  const currentUrlCheck = ripple.currentNodeUrl !== newNodeUrl;
  if (newtowrkNodesCheck && currentUrlCheck) {
    ripple.networkNodes.push(newNodeUrl);
  }
  res.json({ note: "New Node Regitered uccessfully." });
});

// To register updated node list on newly created node
app.post("/register-bulk-nodes", function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((url) => {
    const networkNodeCheck = ripple.networkNodes.indexOf(url) == -1;
    const curentNodeUrlCheck = ripple.currentNodeUrl !== url;
    if (networkNodeCheck && curentNodeUrlCheck) {
      ripple.networkNodes.push(url);
    }
  });

  res.json({ note: "Bulk registration Successful." });
});

app.get("/consensus", function (req, res) {
  const reqPromises = [];
  ripple.networkNodes.forEach((nodeUrl) => {
    const reqOptions = {
      uri: nodeUrl + "/blockchain",
      method: "GET",
      json: true,
    };

    reqPromises.push(RP(reqOptions));
  });

  Promise.all(reqPromises).then((blockchains) => {
    let currentChainLength = ripple.chain.length;
    let maxChainLength = currentChainLength;
    let longestBlockChain = null;
    let longChainPendingTransactions = null;
    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        longestBlockChain = blockchain.chain;
        longChainPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !longestBlockChain ||
      (longestBlockChain && !ripple.isValidChain(longestBlockChain))
    ) {
      res.json({
        note: " This chain is not been replaced.",
        chain: ripple.chain,
      });
    } else {
      ripple.chain = longestBlockChain;
      ripple.pendingTransactions = longChainPendingTransactions;
      res.json({
        note: "This is chain has been replaced.",
        chain: ripple.chain,
      });
    }
  });
});

app.get("/block/:hash", function (req, res) {
  const hash = req.params.hash;
  const block = ripple.getBlock(hash);
  block !== null
    ? res.json({ note: "Block found", block: block })
    : res.json({ note: "Block Not Found" });
});

app.get("/transaction/:transactionId", function (req, res) {
  const transactionId = req.params.transactionId;
  const transactionData = ripple.getTransaction(transactionId);
  const foundData =
    transactionData.transaction !== null && transactionData.block !== null;

  foundData
    ? res.json({
        transaction: transactionData.transaction,
        block: transactionData.block,
      })
    : res.json({ note: "No Match Found." });
});

app.get("/address/:address", function (req, res) {
  const address = req.params.address;
  const addressData = ripple.getAddress(address);
  const foundData = addressData.transactions.length !== 0;
  foundData
    ? res.json({
        totalTransactionAmount: addressData.totalTransactionAmount,
        transactions: addressData.transactions,
      })
    : res.json({ note: "No Transactions Found." });
});

app.get("/block-explorer", function (req, res) {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(PORT, "Localhost", function () {
  console.log(`Server Started and Running on Port ${PORT}`);
});
