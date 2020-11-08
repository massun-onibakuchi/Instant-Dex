import { expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import SwapPool from '../artifacts/contracts/SwapPool.sol/SwapPool.json';

const privier = waffle.provider;


describe('BasicToken', async () => {
  // const [wallet, walletTo] = privier.getWallets();
  let accounts: Signer[] = await ethers.getSigners();
  let token: Contract;
  let factory: Contract;
  let weth: Contract;
  let transferLib: Contract;
  let periphery: Contract;
  let pool: Contract;

  beforeEach(async () => {
    const BasicToken = await ethers.getContractFactory("BasicToken", accounts[0]);
    token = await BasicToken.deploy(1000);
    await token.deployed();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();

    const WETH = await ethers.getContractFactory("WETH9");
    weth = await WETH.deploy();
    await weth.deployed();

    const TransferHelper = await ethers.getContractFactory("TransferHelper");
    transferLib = await TransferHelper.deploy();
    await transferLib.deployed();

    // const Periphery = await ethers.getContractFactory("Periphery");
    // periphery = await Periphery.deploy(weth.address, factory.address);
    // await periphery.deployed();

    const testToken = token.address;
    const salt = solidityKeccak256(["address"], [testToken]); // keccak256(solidityPack(["address"], [testToken]));
    const initCodeHash = solidityKeccak256(["bytes"], [SwapPool.bytecode]); // keccak256(salt)
    const create2Address = getCreate2Address(factory.address, salt, initCodeHash);

    await factory.createPool(testToken);
    pool = await ethers.getContractAt("SwapPool", create2Address, accounts[0])

  });

  it('transfer: rToken', async () => {
    await token.transfer(pool.address, 7);
    expect(await pool.mint(accounts[0])).to.equal(7);
    await pool.transfer(accounts[1], 4)
    expect(await pool.balanceOf(accounts[0])).to.equal(3);
    expect(await pool.balanceOf(accounts[1])).to.equal(4);
  });

  it('mint: emit Sync event ', async () => {
    await token.transfer(pool.address, 7);
    await expect(pool.mint(accounts[0]))
      .to.emit(pool, 'Sync')
      .withArgs(7);
  });

  it('mint: adds amount to destination account', async () => {
    await token.transfer(pool.address, 7);
    expect(await token.balanceOf(pool.address)).to.equal(7);
    expect(await pool.mint(accounts[0])).to.equal(7);
    expect(await pool.balanceOf(accounts[0])).to.equal(7);
  });
  
  it('mint:emit Mint event', async () => {
    await token.transfer(pool.address, 7);
    await expect(pool.mint(accounts[1]))
    .to.emit(pool, 'Mint')
    .withArgs(accounts[0], 7);
  });

  it('burn: adds amount to destination account', async () => {
    await token.transfer(pool.address, 7);
    await pool.burn(accounts[0])
    expect(await token.balanceOf(pool.address)).to.equal(7);
    expect(await pool.burn(accounts[1])).to.equal(7);
    expect(await pool.balanceOf(accounts[1])).to.equal(7);
  });
  
  it('burn:emit Burn event', async () => {
    await token.transfer(pool.address, 7);
    await pool.mint(accounts[0], 7);
    await expect(pool.burn(accounts[0]))
      .to.emit(pool, 'Burn')
      .withArgs(accounts[0], 7);
  });

  it('burn: emit Sync event ', async () => {
    await token.transfer(pool.address, 7);
    await pool.mint(accounts[0]);
    await expect(pool.burn(accounts[1]))
      .to.emit(pool, 'Sync')
      .withArgs(0);
  });


  // it('swap', async () => {
  //   await token.transfer(walletTo.address, 7);
  //   expect(await token.balanceOf(walletTo.address)).to.equal(7);
  // });


  // it('Can not transfer above the amount', async () => {
  //   await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  // });

  // it('Can not transfer from empty account', async () => {
  //   const tokenFromOtherWallet = token.connect(walletTo);
  //   await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
  //     .to.be.reverted;
  // });

  // it('Assigns initial balance', async () => {
  //   expect(await token.balanceOf(wallet.address)).to.equal(1000);
  // });

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