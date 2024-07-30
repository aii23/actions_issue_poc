# Mina zkApp: Action_bug_poc

Scripts for reproducing "Failed to derive correct actions hash".
Seems like this.sender.getAndRequireSignature() is the issue.
Here we provide two contracts:

1. Dispatch actions with current sender (with this.sender.getAndRequireSignature()). It's fails.
2. Dispatch actions with predefined sender. It run succesfully.

Issue ocured when 3 or more transactions with actions gets into one block.

## How to build

```sh
npm install
npm run build
```

## Configure deployment

If you do not have lightnetDeployer, run

```sh
zk config --lightnet
```

And then change `<your fee payer key>` in config.json with a path to your lightnet fee payer. It can be found in config.json `lightnet1` `feepayerKeyPath`

## How to reproduce bug

```sh
./lightnet_reproduce.sh
```

## How to check valid struct(with no getAndRequireSignature)

```sh
./lightnet_valid.sh
```

## License

[Apache-2.0](LICENSE)
