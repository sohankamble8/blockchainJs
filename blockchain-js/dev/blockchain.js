const SHA256 = require("sha256");
const uuid = require("uuid");
const currentNodeUrl = process.argv[3];

// Creating Blcokchain Fucntion constructor
function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];

  if (this.chain.length == 0) {
    const nonce = this.proofOfWork(
      "000000000000000000000000000000000000000000000000000000000000000",
      0
    );
    this.createNewBlock(
      nonce,
      "000000000000000000000000000000000000000000000000000000000000000",
      this.hashBlock(
        "000000000000000000000000000000000000000000000000000000000000000",
        nonce,
        0
      )
    );
  }
}

//  Method to create New Block in Blockchain
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  const blockchainSize = this.chain.length;
  const newBlock = {
    index: blockchainSize + 1,
    timeStamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

// Method to get Last added block
Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

// Method to create new Transaction and Add that Pending transactions for Upcoming Block in Blockchain
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  receiver
) {
  const nullCheck = amount == null && sender == null && receiver == null;
  if (nullCheck) {
    return;
  }
  const newTransaction = {
    timeStamp: Date.now(),
    amount: amount,
    sender: sender,
    receiver: receiver,
    transactionId: uuid.v4().split("-").join(""),
  };
  return newTransaction;
};

Blockchain.prototype.broadcastTransactionToPendingTransactions = function (
  transactionObj
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

// Method to create Hash for Block
Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  nonce,
  currentBlockdata
) {
  const data =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockdata);
  const hash = SHA256(data);
  return hash;
};

// Method to create Hash prefixed with 0000
Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockdata
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, nonce, currentBlockdata);
  // while (hash.substring(0, 20) !== "00000000000000000000") {
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, nonce, currentBlockdata);
  }
  return nonce;
};

// Checks the Chain of blocks is Valid or Not
Blockchain.prototype.isValidChain = function (blockchain) {
  let isValidChain = true;
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(previousBlock.hash, currentBlock.nonce, {
      index: currentBlock.index,
      transactions: currentBlock.transactions,
    });
    if (currentBlock.previousBlockHash !== previousBlock.hash)
      isValidChain = false;
    if (
      currentBlock.hash.substring(0, 4) !== "0000" ||
      blockHash.substring(0, 4) !== "0000" ||
      currentBlock.hash !== blockHash
    )
      isValidChain = false;
  }

  const genesisBlock = blockchain[0];
  const correctHash =
    genesisBlock.hash ===
    "0000e355dc8326bebc98a6024473d3a7700815d6c7b24f4c09a0e4d47e0685bc";
  const correctPreviousHash =
    genesisBlock.previousBlockHash ===
    "000000000000000000000000000000000000000000000000000000000000000";
  const correctNonce = genesisBlock.nonce === 5639;
  const correctTransactions = genesisBlock.transactions.length === 0;
  if (
    !correctHash ||
    !correctPreviousHash ||
    !correctNonce ||
    !correctTransactions
  ) {
    isValidChain = false;
  }

  return isValidChain;
};

// Get the block by block hash
Blockchain.prototype.getBlock = function (hash) {
  let blockFound = null;
  this.chain.forEach((block) => {
    if (block.hash === hash) blockFound = block;
  });
  return blockFound;
};

// Get transaction by using transactionId
Blockchain.prototype.getTransaction = function (transactionId) {
  let foundTransaction = null;
  let transactionFoundBlock = null;
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.transactionId === transactionId) {
        foundTransaction = transaction;
        transactionFoundBlock = block;
      }
    });
  });
  return { transaction: foundTransaction, block: transactionFoundBlock };
};

// Get Sender or Receiver by passing their Address
Blockchain.prototype.getAddress = function (address) {
  const foundTransactions = [];
  let amount = 0;
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.sender === address || transaction.receiver === address) {
        foundTransactions.push(transaction);
      }

      if (transaction.sender === address) amount -= transaction.amount;
      if (transaction.receiver === address) amount += transaction.amount;
    });
  });

  return { totalTransactionAmount: amount, transactions: foundTransactions };
};

module.exports = Blockchain;
