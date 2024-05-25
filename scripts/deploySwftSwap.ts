import * as fs from "fs";
import * as dotenv from 'dotenv';
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV4, Slice } from "@ton/ton";
import { toNano, Address } from "@ton/core"
import swftSwap from "../wrappers/swftSwap"; // this is the interface class from step 7
dotenv.config(); 

export async function run() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const code = Cell.fromBoc(fs.readFileSync("build/swftSwap.cell"))[0];
  const mnemonic = process.env.MNEMONIC!;
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const main = swftSwap.createForDeploy(code, {
    seqno: 0,
    publicKey: key.publicKey,
    ownerAddress: Address.parse('0QDdDw43q8q-RvuAMGxUjqG4pidSf8P2wPB4e8gmFRTHpbTM'),
  });

  // exit if contract is already deployed
  // console.log("contract address:", main.address.toString());
  // if (await client.isContractDeployed(main.address)) {
  //   return console.log("Counter already deployed");
  // }

  // open wallet v4 (notice the correct wallet version here)

  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // send the deploy transaction
  const counterContract = client.open(main);
  await counterContract.sendDeploy(walletSender, toNano('0.05'));

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("deploy transaction confirmed!");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
run().then()