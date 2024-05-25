import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Address, WalletContractV4, JettonMaster } from "@ton/ton";
import { toNano } from "@ton/core"
import Main from "../wrappers/swftSwap"; // this is the interface class we just implemented
import * as dotenv from 'dotenv';
dotenv.config(); 
export async function run() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const jettonMasterAddress = Address.parse('kQD9ZZHDdRpaFJ-QeQqgiU6a82spUQC2RaMeZEOdYaWVxgH0') // 例如 EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE
  const userAddress = Address.parse('EQDWS_4lWUrOgX6pqTWOhHoKQVyN_zakx7Vy4OjOk7Ra_Hu1')
  
  const jettonMaster = client.open(JettonMaster.create(jettonMasterAddress))
  console.log(await jettonMaster.getWalletAddress(userAddress))
}
run().then()