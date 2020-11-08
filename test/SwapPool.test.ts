import { expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract, Signer } from "ethers";
const { deployContract, link } = waffle;
const privier = waffle.provider;
import BasicToken from '../artifacts/contracts/BasicToken.sol/BasicToken.json';
import Factory from '../artifacts/contracts/Factory.sol/Factory.json';
import Periphery from '../artifacts/contracts/Periphery.sol/Periphery.json';
import TransferHelper from '../artifacts/contracts/libraries/TransferHelper.sol/TransferHelper.json';


describe('BasicToken', () => {
  const [wallet, walletTo] = privier.getWallets();
  let token: Contract;
  let transferLib: Contract;
  let factory: Contract;
  let periphery: Contract;


  beforeEach(async () => {
    const [owner, addr1] = await ethers.getSigners();
    let accounts: Signer[] = await ethers.getSigners();
    token = await deployContract(wallet, BasicToken, [1000]);

    factory = await deployContract(wallet, Factory, []);

    transferLib = await deployContract(wallet, TransferHelper, []);

    link(Periphery, 'contracts/Periphery.sol:Periphery', transferLib.address);
    periphery = await deployContract(wallet, Periphery, []);
    
    // const BasicToken = await ethers.getContractFactory("BasicToken");
    // token = await BasicToken.deploy(1000);
    // const BasicToken = await ethers.getContractFactory("BasicToken");
    // token = await BasicToken.deploy(1000);
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