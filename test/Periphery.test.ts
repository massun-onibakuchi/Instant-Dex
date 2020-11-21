import { expect } from 'chai';
import { waffle } from "hardhat";
import { peripheryFixture, poolFixture } from './utilities/fixture';
import { zeroAddress } from './utilities/utils';

import { SwapPool } from "../typechain/SwapPool";
import { BasicToken } from "../typechain/BasicToken";
import { Factory } from "../typechain/Factory";
import { Periphery } from '../typechain/Periphery';
import { WETH9 as WETH, WETH9 } from '../typechain/WETH9';
import { Contract } from 'ethers';
import { poll } from 'ethers/lib/utils';

const overrides = {
  gasLimit: 9500000
}
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

  async function addLiquidity(token: Contract, to: string, amount: number) {
    // First, approve periphery Contract transfering user's ERC20 token, then call addLiquidity
    await token.approve(periphery.address, amount)
    await periphery.addLiquidity(token.address, to, amount, overrides)
  }
  async function removeLiquidity(pool: SwapPool, token: Contract, to: string, amount: number) {
    // First, approve periphery Contract transfering user's LP token, then call addLiquidity
    await pool.approve(periphery.address, amount)
    await periphery.removeLiquidity(token.address, to, amount, overrides)
  }

  it('addLiquidity: add liquidity to destination account', async () => {
    const amount = 10;
    const expectedLiquidity = 10;
    await addLiquidity(basicToken, other.address, amount)

    expect(await basicToken.balanceOf(basicPool.address)).to.eq(amount)
    expect(await basicToken.balanceOf(wallet.address)).to.eq(1000 - amount)
    expect(await basicToken.balanceOf(other.address)).to.eq(0)

    expect(await basicPool.balanceOf(wallet.address)).to.eq(0)
    expect(await basicPool.balanceOf(other.address)).to.eq(expectedLiquidity)
  });

  it('removeLiquidity: remove liquidity to destination account', async () => {
    const amount = 10;
    await addLiquidity(basicToken, wallet.address, amount)
    await removeLiquidity(basicPool, basicToken, other.address, amount)

    expect(await basicToken.balanceOf(basicPool.address)).to.eq(0)
    expect(await basicToken.balanceOf(wallet.address)).to.eq(1000 - amount)
    expect(await basicToken.balanceOf(other.address)).to.eq(amount)

    expect(await basicPool.balanceOf(wallet.address)).to.eq(0)
    expect(await basicPool.balanceOf(other.address)).to.eq(0)
    expect(await basicPool.totalSupply()).to.eq(0)
  });

  it('addLiquidityETH: mint to destination account', async () => {
    const ethAmount = 10;
    const expectedLiquidity = 10;
    await periphery.addLiquidityETH(other.address, { ...overrides, value: ethAmount })

    expect(await provider.getBalance(weth.address)).to.eq(ethAmount)
    expect(await weth.balanceOf(wethPool.address)).to.eq(ethAmount)
    expect(await weth.balanceOf(periphery.address)).to.eq(0)
    expect(await weth.totalSupply()).to.eq(ethAmount)

    expect(await wethPool.balanceOf(wallet.address)).to.eq(0)
    expect(await wethPool.balanceOf(other.address)).to.eq(expectedLiquidity)
  });

  it('removeLiquidityETH: remove eth liquidity to destination account', async () => {
    const ethAmount = 10;
    const initialEthBalance = await provider.getBalance(other.address);

    await periphery.addLiquidityETH(wallet.address, { ...overrides, value: ethAmount })

    await wethPool.approve(periphery.address, ethAmount)
    await periphery.removeLiquidityETH(other.address, ethAmount, overrides)

    expect(await provider.getBalance(wethPool.address)).to.eq(0)
    expect(await provider.getBalance(other.address)).to.eq(initialEthBalance.add(ethAmount))
    expect(await weth.balanceOf(wallet.address)).to.eq(0)
    expect(await weth.balanceOf(other.address)).to.eq(0)
    expect(await weth.balanceOf(periphery.address)).to.eq(0)
    expect(await weth.totalSupply()).to.eq(0)
  });
})