import { assert, expect } from 'chai';
import { ethers, waffle } from "hardhat";
import { getCreate2Address, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { zeroAddress } from './utilities/utils';

import SwapPoolArtifact from '../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicTokenArtifact from '../artifacts/contracts/BasicToken.sol/BasicToken.json';
import FactoryArtifact from '../artifacts/contracts/Factory.sol/Factory.json';

import { BasicToken } from "../typechain/BasicToken";
import { Factory } from "../typechain/Factory";

describe('Factory', () => {
  const { deployContract } = waffle;
  const provider = waffle.provider;
  const [wallet, other] = provider.getWallets();

  let token: BasicToken;
  let factory: Factory;
  beforeEach(async () => {
    token = (await deployContract(wallet, BasicTokenArtifact, [1000])) as BasicToken;
    factory = (await deployContract(wallet, FactoryArtifact)) as Factory;
  });

  it('getCreationCode: bytescode and salt equals to expected ones ', async () => {
    const { bytecode, salt } = await factory.getCreationCode(token.address);
    assert(keccak256(bytecode) == keccak256(SwapPoolArtifact.bytecode), "Wrong bytecode ")
    assert(salt == solidityKeccak256(["address"], [token.address]), "wrong salt ")
  })

  function createPoolAddress(tokenAddress: string, poolArtifact: typeof SwapPoolArtifact) {
    const salt = solidityKeccak256(["address"], [tokenAddress]); // keccak256(solidityPack(["address"], [token.address]));
    const initCodeHash = solidityKeccak256(["bytes"], [poolArtifact.bytecode]); // keccak256(salt)
    const create2Address = getCreate2Address(factory.address, salt, initCodeHash)
    return create2Address
  }

  it('Create Pool', async () => {
    const create2Address = createPoolAddress(token.address, SwapPoolArtifact);
    await expect(factory.createPool(token.address)).to.emit(factory, 'PoolCreated')
      .withArgs(token.address, create2Address);
  });

  it('CreatePool :Can not create pool with zero address ', async () => {
    await expect(factory.createPool(zeroAddress)).to.be.reverted;
  });

  it('CreatePool :Can not create pool with the same token twice', async () => {
    await factory.createPool(token.address);
    await expect(factory.createPool(token.address)).to.be.reverted;
  });


  it('CreatePool: Call token and factory getter on created SwapPoolArtifact contract', async () => {
    const create2Address = createPoolAddress(token.address, SwapPoolArtifact);
    await factory.createPool(token.address);

    // const pool = new Contract(create2Address, JSON.stringify(SwapPool.abi), provider)
    const pool = await ethers.getContractAt("SwapPool", create2Address)
    expect(await pool.token()).to.equal(token.address)
    expect(await pool.factory()).to.equal(factory.address)
  });

  it('getPool: Call getPool on Factory contract', async () => {
    const create2Address = createPoolAddress(token.address, SwapPoolArtifact);
    await factory.createPool(token.address);
    expect(await factory.getPool(token.address)).to.eq(create2Address);
  });
});