import { expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract, Signer } from "ethers";
const { deployContract } = waffle;
const privier = waffle.provider;


describe('BasicToken', () => {
  const [wallet, walletTo] = privier.getWallets();
  let token: Contract;
  let transferLib: Contract;
let factory: Contract;
  let periphery: Contract;
  let weth: Contract;


  beforeEach(async () => {
    const [owner, addr1] = await ethers.getSigners();
    let accounts: Signer[] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();

    const WETH = await ethers.getContractFactory("WETH9");
    weth = await WETH.deploy();
    await weth.deployed();

    const TransferHelper = await ethers.getContractFactory("TransferHelper");
    transferLib = await TransferHelper.deploy();
    await transferLib.deployed();

    const Periphery = await ethers.getContractFactory("Periphery");
    periphery = await Periphery.deploy(weth.address, factory.address);
    await periphery.deployed();

  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000);
  });

  it('Transfer adds amount to destination account', async () => {
    await token.transfer(walletTo.address, 7);
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);
  });

  it('Can not transfer above the amount', async () => {
    await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  });

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
      .to.be.reverted;
  });

  // it('Calls totalSupply on BasicToken contract', async () => {
  //   await token.totalSupply();
  //   expect('totalSupply').to.be.calledOnContract(token);
  // });

  // it('Calls balanceOf with sender address on BasicToken contract', async () => {
  //   await token.balanceOf(wallet.address);
  //   expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  // });
});