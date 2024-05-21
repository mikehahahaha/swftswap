import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell, SendMode } from "@ton/core";
import { Opcodes } from '../helpers/Opcodes';
export type MainConfig = {
  seqno: number;
  publicKey: Buffer;
  ownerAddress: Address;
};

export default class Main implements Contract {

  static createForDeploy(code: Cell, config: MainConfig): Main {
    const data = beginCell()
    .storeUint(config.seqno, 32)
    .storeBuffer(config.publicKey)
    .storeAddress(config.ownerAddress)
    .endCell(); 
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    return new Main(address, { code, data });
  }

  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value: value, 
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }
  async sendDeposit(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value: value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
      .storeUint(Opcodes.deposit, 32)
      .endCell(),
    });
  }

  async sendWithdraw(provider: ContractProvider, via: Sender, 
    opts:{
    value: bigint,
    amount: bigint
  }) 
  {
  await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
          .storeUint(Opcodes.withdraw, 32)
          .storeCoins(opts.amount)
      .endCell(),
  });
  }

  async transferTo(provider: ContractProvider, via: Sender, 
    opts:{
    value: bigint,
    amount: bigint,

  }) 
  {
  await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
          .storeUint(Opcodes.transferMsgToOwner, 32)
          .storeCoins(opts.amount)
      .endCell(),
  });
  }
  async get_smc_balance(provider: ContractProvider): Promise<bigint> {
    const { stack } = await provider.get("get_smc_balance", []);
    return stack.readBigNumber();
  }
  
  async get_owner(provider: ContractProvider): Promise<Address>  {
    const { stack } = await provider.get("get_owner", []);
    return stack.readAddress();
  }
  async get_seqno(provider: ContractProvider): Promise<number> {
    const { stack } = await provider.get("get_seqno", []);
    return stack.readNumber();
  }
}
