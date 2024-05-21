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
  const beforeOwner = await counterContract.get_owner();
  console.log("beforeOwner: " + beforeOwner);
  await counterContract.sendChangeOnwer(walletSender, {value: toNano("0.05"), newOwnerAddress: Address.parse("EQBN5wT_KJCArIt-9EiJ8ItV1EDF6CUj7BqS_CrTnbmSZjxz")});
  const afterOwner = await counterContract.get_owner();
  console.log("afterOwner: " + afterOwner);
  console.log('changeOwner success');
}