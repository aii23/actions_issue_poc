import fs from 'fs/promises';
import { Mina, NetworkId, PrivateKey } from 'o1js';
import {
  BrokenStructActionDispatcher,
  OneFieldActionDispatcher,
  TenFieldActionDispatcher,
  ThreeFieldActionDispatcher,
  ValidStructActionDispatcher,
} from './Dispatchers.js';

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
let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
let zkAppAddress = zkAppKey.toPublicKey();

let zkApp;
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
    networkId: config.networkId as NetworkId,
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
    mina: config.url,
  });
}

Mina.setActiveInstance(Network);

console.log(await zkApp.reducer.fetchActions());
