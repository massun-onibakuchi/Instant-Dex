import { expect } from 'chai';
import { waffle } from "hardhat";
import { poolFixture } from './utilities/fixture';
import { zeroAddress } from './utilities/utils';

import { SwapPool } from "../typechain/SwapPool";
import { BasicToken } from "../typechain/BasicToken";
import { Factory } from "../typechain/Factory";

describe('SwapPool', async () => {
  const INITIAL_LIQUIDITY = 0;

  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();
  const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let factory: Factory;
  let token: BasicToken;
  let pool: SwapPool;
  beforeEach(async () => {
    const fixture = await loadFixture(poolFixture)
    factory = fixture.factory
    token = fixture.token
    pool = fixture.pool

    // const TransferHelper = await ethers.getContractFactory("TransferHelper");
    // transferLib = await TransferHelper.deploy();
    // await transferLib.deployed();

    // const Periphery = await ethers.getContractFactory("Periphery");
    // periphery = await Periphery.deploy(weth.address, factory.address);
    // await periphery.deployed();
  });

  it('mint: emit multiple events', async () => {
    const amount = 10;
    const expectedLiquidity = 10;
    await token.transfer(pool.address, amount);

    await expect(pool.mint(wallet.address))
      .to.emit(pool, 'Transfer')
      .withArgs(zeroAddress, wallet.address, expectedLiquidity)
      .to.emit(pool, 'Sync')
      .withArgs(amount)
      .to.emit(pool, 'Mint')
      .withArgs(wallet.address, expectedLiquidity)
  });

  it('mint: adds and sub amount', async () => {
    const amount = 10
    const expectedLiquidity = 10;
    await token.transfer(pool.address, amount);
    await pool.mint(wallet.address)

    expect(await pool.totalSupply()).to.equal(expectedLiquidity)
    expect(await pool.balanceOf(wallet.address)).to.equal(expectedLiquidity)
    expect(await token.balanceOf(pool.address)).to.equal(amount)
    expect(await pool.getReserve()).to.equal(amount)
  });

  async function addLiquidity(tokenAmount: number) {
    await token.transfer(pool.address, tokenAmount)
    await pool.mint(wallet.address)
  }

  it('burn:emit multiple event', async () => {
    const amount = 10
    const expectedLiquidity = 10;
    await addLiquidity(amount)

    await pool.transfer(pool.address, expectedLiquidity);

    await expect(pool.burn(wallet.address))
      .to.emit(pool, 'Transfer')
      .withArgs(pool.address, zeroAddress, expectedLiquidity)
      .to.emit(pool, 'Sync')
      .withArgs(INITIAL_LIQUIDITY)
      .to.emit(pool, 'Burn')
      .withArgs(wallet.address, expectedLiquidity);
  });

  it('burn: adds and sub amount', async () => {
    const amount = 100
    const expectedLiquidity = 100;
    // add Liquidity and minted to rToken.
    await addLiquidity(amount)
    // transfer rToken to pool and burn
    await pool.transfer(pool.address, expectedLiquidity);
    await pool.burn(wallet.address);

    expect(await pool.balanceOf(wallet.address)).to.eq(0)
    expect(await pool.totalSupply()).to.eq(INITIAL_LIQUIDITY)
    expect(await token.balanceOf(pool.address)).to.eq(0)
    expect(await token.balanceOf(wallet.address)).to.eq(1000)
  });
})