const Blockchain = require("./blockchain");

const ripple = new Blockchain();

// Created or Mined Blocks in Ripple Blockchain
// ripple.createNewBlock(5151);
// ripple.createNewBlock(1582);
// ripple.createNewBlock(6247);

// Adding new transactions which will get added in upcoming new block or upcoming mined block
// ripple.createNewTransaction(200, "KarFBKJFBKFB", "AryAFJKAFKK");
// ripple.createNewTransaction(450, "AryAFJKAFKK", "KarFBKJFBKFB");
// ripple.createNewTransaction(10, "KarFBKJFBKFB", "AryAFJKAFKK");

//Adding new Block to see above Transaction in coming in this or not
// ripple.createNewBlock(7425);

// console.log(ripple);
// console.log(
//   ripple.proofOfWork(
//     ripple.chain[3].previousBlockHash,
//     ripple.chain[3].transactions
//   )
// );
// console.log("Last Block ==>", ripple.getLastBlock());

// const blockchain = {
//   chain: [
//     {
//       index: 1,
//       timeStamp: 1664707151175,
//       transactions: [],
//       nonce: 5639,
//       hash: "0000e355dc8326bebc98a6024473d3a7700815d6c7b24f4c09a0e4d47e0685bc",
//       previousBlockHash:
//         "000000000000000000000000000000000000000000000000000000000000000",
//     },
//     {
//       index: 2,
//       timeStamp: 1664707200162,
//       transactions: [
//         {
//           timeStamp: 1664707166367,
//           amount: 250,
//           sender: "SSGGSFFADADDFFA",
//           receiver: "JHBJHJBJHJFJSFJF",
//           transactionId: "96a9a166deda40aab453b09d0ecd6b58",
//         },
//         {
//           timeStamp: 1664707177769,
//           amount: 300,
//           sender: "SSGGSFFADADDFFA",
//           receiver: "JHBJHJBJHJFJSFJF",
//           transactionId: "9338b11f27d8455484b548d7c3d56e27",
//         },
//       ],
//       nonce: 4363,
//       hash: "0000103b71c49a0ecb0e53a90d07c0f0eda99b89eb1cbfbc86605a257b11a57d",
//       previousBlockHash:
//         "0000e355dc8326bebc98a6024473d3a7700815d6c7b24f4c09a0e4d47e0685bc",
//     },
//     {
//       index: 3,
//       timeStamp: 1664707244758,
//       transactions: [
//         {
//           timeStamp: 1664707200211,
//           amount: 34.375,
//           sender: "00RIPREWARDSYSTEM",
//           receiver: "6bb1a3c5c9604ea092a9f041570dda90",
//           transactionId: "f388d6a096dc4855af20e9f4e98bb69b",
//         },
//         {
//           timeStamp: 1664707222532,
//           amount: 50,
//           sender: "SSGGSFFADADDFFA",
//           receiver: "JHBJHJBJHJFJSFJF",
//           transactionId: "1eca1d9dd6d545179a285578b8187510",
//         },
//         {
//           timeStamp: 1664707228691,
//           amount: 150,
//           sender: "SSGGSFFADADDFFA",
//           receiver: "JHBJHJBJHJFJSFJF",
//           transactionId: "f0ef5dcc49b94f1484e6713dae4ff45a",
//         },
//       ],
//       nonce: 37549,
//       hash: "00007f7d19378379927c4be0487e3525d5de2ac127fc6be99d682cb9ffb28bf3",
//       previousBlockHash:
//         "0000103b71c49a0ecb0e53a90d07c0f0eda99b89eb1cbfbc86605a257b11a57d",
//     },
//     {
//       index: 4,
//       timeStamp: 1664707277040,
//       transactions: [
//         {
//           timeStamp: 1664707244767,
//           amount: 14.6484375,
//           sender: "00RIPREWARDSYSTEM",
//           receiver: "6bb1a3c5c9604ea092a9f041570dda90",
//           transactionId: "6dc8506b10d24b30962f3ba28f15fe92",
//         },
//       ],
//       nonce: 104154,
//       hash: "00003830589377bc398f02fb9f7d786f1a731bc42a7bcbae671004f8a9875c14",
//       previousBlockHash:
//         "00007f7d19378379927c4be0487e3525d5de2ac127fc6be99d682cb9ffb28bf3",
//     },
//   ],
//   pendingTransactions: [
//     {
//       timeStamp: 1664707277053,
//       amount: 0.91552734375,
//       sender: "00RIPREWARDSYSTEM",
//       receiver: "6bb1a3c5c9604ea092a9f041570dda90",
//       transactionId: "644ea184efa84fc698b99f948e009366",
//     },
//   ],
//   currentNodeUrl: "http://localhost:3001",
//   networkNodes: [],
// };

// console.log("VALID:", ripple.isValidChain(blockchain.chain));
