import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Address, WalletContractV4 } from "@ton/ton";
import { toNano } from "@ton/core"
import Main from "../wrappers/BridgersSwap"; // this is the interface class we just implemented
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
  const getMethodResult = await client.runMethod(wallet.address, 'seqno'); // 从你的钱包合约运行"seqno" GET方法
  const walletSeqno = getMethodResult.stack.readNumber();
  console.log('walletSeqno: ', walletSeqno.toString());
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  // call the getter on chain
  const balance = await counterContract.get_smc_balance();
  console.log("balance: ", balance.toString());
  const seqno = await counterContract.get_seqno();
  console.log("seqno: ", seqno.toString());

  await counterContract.sendWithdrawTon(walletSender, {amount: toNano('0.1'), value: toNano('0.05'), destination: Address.parse("0QC3BCiWoG-2CWQ2e3yDc0o0-CZi7hApv5ld-vB25BZ_G8j4"), seqno: BigInt(0)});
  // await counterContract.sendWithdraw(walletSender, {value: toNano('0.05'), amount: toNano("0.001"), jettonWalletAddress: Address.parse("kQDPvZYEUx-AsLRkr5yKryKpr81U5TQ517bbitLDlisVJ1IN"), responseDestination: Address.parse("kQAb6IknKe0JkN-Kc2Z7iYCQRBo5V77-nHcrQa_S7mkEDz55"), forwardTonAmount: toNano("0")});
  console.log('withdraw success');
}