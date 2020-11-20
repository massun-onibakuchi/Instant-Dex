import { expect } from 'chai';
import { waffle,ethers } from "hardhat";
import { Contract } from "ethers";
import { poolFixture } from './utilities/fixture';
import { zeroAddress } from './utilities/utils';

describe('SwapPool', async () => {
  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();
  const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let factory: Contract;
  let token: Contract;
  let pool: Contract;
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
    const amount = 10
    await token.transfer(pool.address, amount);

    await expect(pool.mint(wallet.address))
      .to.emit(pool.address, 'Transfer')
      .withArgs(zeroAddress, wallet.address, amount)
      .to.emit(pool.address, 'Sync')
      .withArgs(amount)
      .to.emit(pool.address, 'Mint')
      .withArgs(wallet.address, token.address)
  });

  it('mint: adds and sub amount', async () => {
    const amount = 10
    const expextedLiquidity = amount;
    await token.transfer(pool.address, amount);
    await pool.mint(wallet.address)

    expect(await pool.totalSupply()).to.equal(expextedLiquidity)
    expect(await pool.balanceOf(wallet.address)).to.equal(expextedLiquidity)
    expect(await token.balanceOf(pool.address)).to.equal(amount)
    const reserves = await pool.getReserve()
    expect(reserves).to.equal(amount)
  });

  async function addLiquidity(tokenAmount: number) {
    await token.transfer(pool.address, tokenAmount)
    await pool.mint(wallet.address)
  }

  it('burn:emit multiple event', async () => {
    const amount = 10
    const expectedLiquidity = amount;
    await addLiquidity(amount)

    await pool.transfer(pool.address, expectedLiquidity);

    await expect(pool.burn(wallet.address))
      .to.emit(pool.address, 'Transfer')
      .withArgs(wallet.address, zeroAddress, amount)
      // .to.emit(token, 'Transfer')
      // .withArgs(pool.address, wallet.address, amount)
      .to.emit(pool.address, 'Sync')
      .withArgs(amount)
      .to.emit(pool.address, 'Burn')
      .withArgs(wallet.address, 7);
  });

  it('burn: adds and sub amount', async () => {
    const amount = 100
    const expectedLiquidity = amount;
    // add Liquidity and minted to rToken.
    await addLiquidity(amount)
    // transfer rToken to pool and burn
    await pool.transfer(pool.address, expectedLiquidity);
    await pool.burn(wallet.address);

    expect(await pool.balanceOf(wallet.address)).to.eq(0)
    expect(await pool.totalSupply()).to.eq(0)
    expect(await token.balanceOf(pool.address)).to.eq(0)
    expect(await token.balanceOf(wallet.address)).to.eq(1000)
  });
})