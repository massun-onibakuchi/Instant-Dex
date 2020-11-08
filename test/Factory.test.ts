import { assert, expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract } from "ethers";
import { BytesLike, getCreate2Address, hexZeroPad, isAddress, keccak256, solidityKeccak256 } from 'ethers/lib/utils';

import SwapPool from '../artifacts/contracts/SwapPool.sol/SwapPool.json';
describe('Factory', () => {
  const provider = waffle.provider;
  const [wallet, walletTo] = provider.getWallets();
  let token: Contract;
  let factory: Contract;
  let weth: Contract;
  let periphery: Contract;
  // let transferLib: Contract;

  beforeEach(async () => {
    const BasicToken = await ethers.getContractFactory("BasicToken");
    token = await BasicToken.deploy(1000);
    await token.deployed();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();

    const WETH = await ethers.getContractFactory("WETH9");
    weth = await WETH.deploy();
    await weth.deployed();

    // const TransferHelper = await ethers.getContractFactory("TransferHelper");
    // transferLib = await TransferHelper.deploy();
    // await transferLib.deployed();

    // const SwapPool = await ethers.getContractFactory("SwapPool");

    // const Periphery = await ethers.getContractFactory("Periphery");
    // periphery = await Periphery.deploy(weth.address, factory.address);
    // await periphery.deployed();
  });

  it('getCreationCode:  bytescode and salt equals to expected ones ', () => {
    const testToken = token.address;
    factory.getCreationCode(testToken)
      .then((res) => {
        const [bytescode, salt, ...rest] = res;
        assert(keccak256(bytescode) == keccak256(SwapPool.bytecode),"Wrong bytecode ")
        assert(salt == solidityKeccak256(["address"], [testToken]),"wrong salt ")
      })
  });

  it('Create Pool', async () => {
    const testToken = token.address;
    const salt = solidityKeccak256(["address"], [testToken]); // keccak256(solidityPack(["address"], [testToken]));
    const initCodeHash = solidityKeccak256(["bytes"], [SwapPool.bytecode]); // keccak256(salt)
    const create2Address = getCreate2Address(factory.address, salt, initCodeHash)

    await expect(factory.createPool(testToken)).to.emit(factory, 'PoolCreated')
      .withArgs(testToken, create2Address);
  });

  it('CreatePool :Can not create pool with zero address ', async () => {
    const zeroAddress = hexZeroPad("0x0", 20);
    // console.log('zeroAddress :>> ',isAddress(zeroAddress));
    await expect(factory.createPool(zeroAddress)).to.be.reverted;
  });

  it('CreatePool :Can not create pool with the same token twice', async () => {
    const testToken = token.address;
    await factory.createPool(testToken);
    await expect(factory.createPool(testToken)).to.be.reverted;
  });

  it('getPool', async () => {
    const testToken = token.address;
    const pool = await factory.createPool(testToken);
    const contract = await factory.getPool(testToken);
    Promise.resolve(() => expect(pool).to.equal(contract));
  });
  // it('Transfer emits event', async () => {
  //   await expect(token.transfer(walletTo.address, 7))
  //     .to.emit(token, 'Transfer')
  //     .withArgs(wallet.address, walletTo.address, 7);
  // });

  // it('Can not transfer above the amount', async () => {
  //   await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  // });

  // it('Can not transfer from empty account', async () => {
  //   const tokenFromOtherWallet = token.connect(walletTo);
  //   await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
  //     .to.be.reverted;
  // });

  // it('Calls totalSupply on BasicToken contract', async () => {
  //   await token.totalSupply();
  //   expect('totalSupply').to.be.calledOnContract(token);
  // });

  // it('Calls balanceOf with sender address on BasicToken contract', async () => {
  //   await token.balanceOf(wallet.address);
  //   expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  // });
});