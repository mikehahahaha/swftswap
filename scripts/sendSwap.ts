import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Address, WalletContractV4 } from "@ton/ton";
import { toNano } from "@ton/core"
import Main from "../wrappers/swftSwap"; // this is the interface class we just implemented
import * as dotenv from 'dotenv';
dotenv.config(); 
export async function run() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  // open Counter instance by address
  const counterAddress = Address.parse(process.env.MAIN_CONTRACT_ADDRESS!); // replace with your address from step 8
  const counter = new Main(counterAddress);
  const counterContract = client.open(counter);

  const mnemonic = process.env.MNEMONIC!; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }

  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  // call the getter on chain 
  // await counterContract.sendSwap(walletSender, {value: toNano('0.05'), amount: toNano("900000"), jettonWalletAddress: Address.parse("kQDi_C45cP3AaznjVDZlyhY50TjVnUrGrJHyKuMyyx5Dxzy_"), responseDestination: Address.parse("kQC9hcZC5yNaoqsCV6zJa9O1dtI21HCtazLaexvi-rKNnkPu")});
  await counterContract.sendSwap(walletSender, {value: toNano('0.05'), amount: toNano("0.01"), jettonWalletAddress: Address.parse("kQDi_C45cP3AaznjVDZlyhY50TjVnUrGrJHyKuMyyx5Dxzy_"), responseDestination: Address.parse("EQBsCeERqn5R5xQg2RV5vUz9lhPv-QCKkCDBXYxAg0LUbcDg"), forwardTonAmount: toNano("0.01")});
  console.log('sendSwap success');
}