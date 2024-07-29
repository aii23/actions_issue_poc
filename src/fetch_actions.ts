import fs from 'fs/promises';
import { Mina, PrivateKey } from 'o1js';
import {
  OneFieldActionDispatcher,
  TenFieldActionDispatcher,
  ThreeFieldActionDispatcher,
} from './Dispatchers.js';

let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);

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
if (deployAlias.slice(0, 3) == 'one') {
  zkApp = new OneFieldActionDispatcher(zkAppAddress);
} else if (deployAlias.slice(0, 5) == 'three') {
  zkApp = new ThreeFieldActionDispatcher(zkAppAddress);
} else if (deployAlias.slice(0, 3) == 'ten') {
  zkApp = new TenFieldActionDispatcher(zkAppAddress);
} else {
  throw Error('Wrong contract name. Should be One, Three, Ten');
}

const Network = Mina.Network({
  // We need to default to the testnet networkId if none is specified for this deploy alias in config.json
  // This is to ensure the backward compatibility.
  // networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
  // mina: config.url,
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});

Mina.setActiveInstance(Network);

console.log(await zkApp.reducer.fetchActions());
