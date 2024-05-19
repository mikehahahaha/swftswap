import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import Main from "../wrappers/Main"; // this is the interface class we just implemented
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

  // call the getter on chain
  const counterValue = await counterContract.get_owner();
  console.log("value:", counterValue.toString());
}