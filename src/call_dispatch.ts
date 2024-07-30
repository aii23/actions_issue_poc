/**
 * This script can be used to interact with the Add contract, after deploying it.
 *
 * We call the update() method on the contract, create a proof and send it to the chain.
 * The endpoint that we interact with is read from your config.json.
 *
 * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
 * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
 * would send the transaction and pay the fee.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js <deployAlias>`.
 */
import fs from 'fs/promises';
import { Lightnet, Mina, NetworkId, PrivateKey } from 'o1js';
import {
  BrokenStructActionDispatcher,
  OneFieldActionDispatcher,
  TenFieldActionDispatcher,
  ThreeFieldActionDispatcher,
  ValidStructActionDispatcher,
} from './Dispatchers.js';

// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);

const isLightnet = deployAlias.includes('light');
const isOne = deployAlias.includes('one');
const isThreee = deployAlias.includes('three');
const isTen = deployAlias.includes('ten');
const isBrokenStruct = deployAlias.includes('brokenstruct');
const isValidStruct = deployAlias.includes('validstruct');

let dispatchAmountPerBlockStr = process.argv[3];
let dispatchAmountPerBlock = 0;

if (!dispatchAmountPerBlockStr) {
  throw Error(`Missing <dispatchAmountPerBlock> `);
}

dispatchAmountPerBlock = +dispatchAmountPerBlockStr;

Error.stackTraceLimit = 1000;
const DEFAULT_NETWORK_ID = 'testnet';

// parse config and private key from file
type Config = {
  deployAliases: Record<
    string,
    {
      networkId?: string;
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[deployAlias];
let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

let Network;
if (isLightnet) {
  Network = Mina.Network({
    // We need to default to the testnet networkId if none is specified for this deploy alias in config.json
    // This is to ensure the backward compatibility.
    mina: 'http://localhost:8080/graphql',
    archive: 'http://localhost:8282',
    lightnetAccountManager: 'http://localhost:8181',
  });
} else {
  Network = Mina.Network({
    // We need to default to the testnet networkId if none is specified for this deploy alias in config.json
    // This is to ensure the backward compatibility.
    networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
    mina: config.url,
  });
}
// const Network = Mina.Network(config.url);
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
Mina.setActiveInstance(Network);

let feePayers = [
  { publicKey: feepayerKey.toPublicKey(), privateKey: feepayerKey },
];

if (isLightnet) {
  feePayers = [];
  for (let i = 0; i < dispatchAmountPerBlock; i++) {
    feePayers.push(await Lightnet.acquireKeyPair());
  }
}
let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();

// let zkApp = new Add(zkAppAddress);
let zkApp: {
  dispatch(): Promise<any>;
};

if (isOne) {
  console.log('OneFieldActionDispatcher');
  zkApp = new OneFieldActionDispatcher(zkAppAddress);
  await OneFieldActionDispatcher.compile();
} else if (isThreee) {
  console.log('ThreeFieldActionDispatcher');
  zkApp = new ThreeFieldActionDispatcher(zkAppAddress);
  await ThreeFieldActionDispatcher.compile();
} else if (isTen) {
  console.log('TenFieldActionDispatcher');
  zkApp = new TenFieldActionDispatcher(zkAppAddress);
  await TenFieldActionDispatcher.compile();
} else if (isBrokenStruct) {
  console.log('BrokenStructActionDispatcher');
  zkApp = new BrokenStructActionDispatcher(zkAppAddress);
  await BrokenStructActionDispatcher.compile();
} else if (isValidStruct) {
  console.log('ValidStructActionDispatcher');
  zkApp = new ValidStructActionDispatcher(zkAppAddress);
  await ValidStructActionDispatcher.compile();
} else {
  throw Error('Wrong contract name. Should be One, Three, Ten');
}

try {
  let txs = [];
  for (let i = 0; i < dispatchAmountPerBlock; i++) {
    let payer = feePayers[i % feePayers.length];
    let tx = await Mina.transaction(
      { sender: payer.publicKey, fee: fee },
      async () => {
        await zkApp.dispatch();
      }
    );

    await tx.prove();

    console.log(`Tx ${i} payer: ${payer.publicKey.toBase58()}`);

    txs.push({ tx, privateKey: payer.privateKey });
  }

  let txPromisis = txs.map((tx) => tx.tx.sign([tx.privateKey]).send());

  (await Promise.all(txPromisis)).forEach((txInfo) =>
    console.log(`Tx: https://minascan.io/devnet/tx/${txInfo.hash}?type=zk-tx`)
  );
} catch (err) {
  console.log(err);
}

function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
  const hostName = new URL(graphQlUrl).hostname;
  const txnBroadcastServiceName = hostName
    .split('.')
    .filter((item) => item === 'minascan')?.[0];
  const networkName = graphQlUrl
    .split('/')
    .filter((item) => item === 'mainnet' || item === 'devnet')?.[0];
  if (txnBroadcastServiceName && networkName) {
    return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
  }
  return `Transaction hash: ${txnHash}`;
}
