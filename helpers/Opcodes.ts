import { crc32 } from "./crc32";

export const Opcodes = {
    selfdestruct: crc32("selfdestruct"),
    deposit: crc32("deposit"),
    withdrawFunds: crc32("withdrawETH"),
    changeOwner: crc32("change_owner"),
    transferMsgToOwner: crc32("transfer_msg_to_owner"),
    swap: crc32("bridgersSwap"),
    swapETH: crc32("bridgersSwapETH"),
    withdraw: crc32("withdraw"),
    transfer: 260734629
};