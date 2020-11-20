import { expect } from 'chai';
import { waffle } from "hardhat";
import { peripheryFixture } from './utilities/fixture';
import { zeroAddress } from './utilities/utils';

import { SwapPool } from "../typechain/SwapPool";
import { BasicToken } from "../typechain/BasicToken";
import { Factory } from "../typechain/Factory";
import { Periphery } from '../typechain/Periphery';

describe('Periphery', async () => {
  const INITIAL_LIQUIDITY = 0;

  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();
  const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let factory: Factory;
  let basicToken: BasicToken;
  let basicPool: SwapPool;
  let wethPool: SwapPool;
  let periphery:Periphery;
  beforeEach(async () => {
    const fixture = await loadFixture(peripheryFixture)
    factory = fixture.factory
    basicToken = fixture.basicToken
    basicPool = fixture.basicPool
    wethPool = fixture.wethPool
    periphery = fixture.periphery
  });

  it('mint: emit multiple events', async () => {
    const amount = 10;
    const expectedLiquidity = 10;
    await basicToken.transfer(basicPool.address, amount);

    await expect(basicPool.mint(wallet.address))
      .to.emit(basicPool, 'Transfer')
      .withArgs(zeroAddress, wallet.address, expectedLiquidity)
      .to.emit(basicPool, 'Sync')
      .withArgs(amount)
      .to.emit(basicPool, 'Mint')
      .withArgs(wallet.address, expectedLiquidity)
  });

  async function addLiquidity(tokenAmount: number) {
    await basicToken.transfer(basicPool.address, tokenAmount)
    await basicPool.mint(wallet.address)
  }

})