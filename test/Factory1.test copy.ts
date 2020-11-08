import { expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract } from "ethers";
import { getCreate2Address } from 'ethers/lib/utils';
const { deployContract } = waffle;

import Factory from '../artifacts/contracts/Factory.sol/Factory.json';
import WETH9 from '../artifacts/contracts/tests/WETH9.sol/WETH9.json';
import SwapPool from '../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicToken from '../artifacts/contracts/BasicToken.sol/BasicToken.json';

import Periphery from '../artifacts/contracts/Periphery.sol/Periphery.json';
import TransferHelper from '../artifacts/contracts/libraries/TransferHelper.sol/TransferHelper.json';

describe('Factory', () => {
  const provider = waffle.provider;
  const [wallet, walletTo] = provider.getWallets();
  let token: Contract;
  let transferLib: Contract;
  let factory: Contract;
  let periphery: Contract;
  let weth: Contract;

  beforeEach(async () => {

    token = await deployContract(wallet, BasicToken, [1000]);

    weth = await deployContract(wallet, WETH9, []);

    transferLib = await deployContract(wallet, TransferHelper, []);

    factory = await deployContract(wallet, Factory, []);

    periphery = await deployContract(wallet, Periphery, [weth.address, factory.address]);
  });

  it('Create Pool', async () => {
    const testToken = token.address;
    const initCodeHash = SwapPool.bytecode;
    const create2Address = getCreate2Address(factory.address, testToken, initCodeHash)
    console.log('testToken :>> ', testToken);
    
    await expect(factory.createPool(testToken)).to.emit(factory, 'PoolCreated')
      .withArgs(testToken, create2Address);
  });

  // it('Transfer adds amount to destination account', async () => {
  //   await token.transfer(walletTo.address, 7);
  //   expect(await token.balanceOf(walletTo.address)).to.equal(7);
  // });

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