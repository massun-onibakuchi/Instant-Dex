import { expect } from 'chai';
import { waffle } from "hardhat";
import { peripheryFixture } from './utilities/fixture';
import { zeroAddress } from './utilities/utils';

import { SwapPool } from "../typechain/SwapPool";
import { BasicToken } from "../typechain/BasicToken";
import { Factory } from "../typechain/Factory";
import { Periphery } from '../typechain/Periphery';
import { WETH9 as WETH } from '../typechain/WETH9';

describe('Periphery: basic function', async () => {
  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();
  const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let factory: Factory;
  let basicToken: BasicToken;
  let weth: WETH
  let basicPool: SwapPool;
  let wethPool: SwapPool;
  let periphery: Periphery;
  beforeEach(async () => {
    const fixture = await loadFixture(peripheryFixture)
    factory = fixture.factory
    basicToken = fixture.basicToken
    weth = fixture.weth
    basicPool = fixture.basicPool
    wethPool = fixture.wethPool
    periphery = fixture.periphery
  });

  it('getter: Call getter of WETH and factory address', async () => {
    expect(await periphery.WETH()).to.eq(weth.address)
    expect(await periphery.factory()).to.eq(factory.address)
  });

})

describe('Periphery: ERC20 token pool', async () => {
  const INITIAL_LIQUIDITY = 0;
  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();
  const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let factory: Factory;
  let basicToken: BasicToken;
  let basicPool: SwapPool;
  let wethPool: SwapPool;
  let periphery: Periphery;
  beforeEach(async () => {
    const fixture = await loadFixture(peripheryFixture)
    factory = fixture.factory
    basicToken = fixture.basicToken
    basicPool = fixture.basicPool
    wethPool = fixture.wethPool
    periphery = fixture.periphery
  });

  it('addLiquidity: mint to destination account', async () => {
    const amount = 10;
    const expectedLiquidity = 10;

    expect(await periphery.addLiquidity(basicToken.address, other.address, amount,)).to.eq(expectedLiquidity)
    expect(await basicToken.balanceOf(basicPool.address)).to.eq(amount)
    expect(await basicToken.balanceOf(wallet.address)).to.eq(1000 - amount)
    expect(await basicToken.balanceOf(other.address)).to.eq(0)

    expect(await basicPool.balanceOf(wallet.address)).to.eq(0)
    expect(await basicPool.balanceOf(other.address)).to.eq(expectedLiquidity)

    // await expect(basicPool.mint(other.address))
    //   .to.emit(basicPool, 'Transfer')
    //   .withArgs(zeroAddress, wallet.address, expectedLiquidity)
    //   .to.emit(basicPool, 'Sync')
    //   .withArgs(amount)
    //   .to.emit(basicPool, 'Mint')
    //   .withArgs(other.address, expectedLiquidity)
  });

  it('addLiquidity: Cannot call mint on pool that has not exists yet', async () => {
    const amount = 10;
    expect(await periphery.addLiquidity(basicToken.address, other.address, amount)).to.be.reverted
  });

  async function addLiquidity(tokenAmount: number) {
    await basicToken.transfer(basicPool.address, tokenAmount)
    await basicPool.mint(wallet.address)
  }

})