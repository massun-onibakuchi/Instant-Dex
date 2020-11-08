import { assert, expect } from 'chai';
import { waffle, ethers } from "hardhat";
import { Contract, } from "ethers";
import { getCreate2Address, hexZeroPad, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import SwapPool from '../artifacts/contracts/SwapPool.sol/SwapPool.json';

describe('Factory', () => {
  let token: Contract;
  let factory: Contract;

  beforeEach(async () => {
    const BasicToken = await ethers.getContractFactory("BasicToken");
    token = await BasicToken.deploy(1000);
    await token.deployed();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();
  });

  it('getCreationCode:  bytescode and salt equals to expected ones ', () => {
    const testToken = token.address;
    factory.getCreationCode(testToken)
      .then((res) => {
        const [bytescode, salt, ...rest] = res;
        assert(keccak256(bytescode) == keccak256(SwapPool.bytecode), "Wrong bytecode ")
        assert(salt == solidityKeccak256(["address"], [testToken]), "wrong salt ")
      })
  });

  it('Create Pool', async () => {
    const testToken = token.address;
    const salt = solidityKeccak256(["address"], [testToken]); // keccak256(solidityPack(["address"], [testToken]));
    const initCodeHash = solidityKeccak256(["bytes"], [SwapPool.bytecode]); // keccak256(salt)
    const create2Address = getCreate2Address(factory.address, salt, initCodeHash)

    await expect(factory.createPool(testToken)).to.emit(factory, 'PoolCreated')
      .withArgs(testToken, create2Address);
  });

  it('CreatePool :Can not create pool with zero address ', async () => {
    const zeroAddress = hexZeroPad("0x0", 20);
    // console.log('zeroAddress :>> ',isAddress(zeroAddress));
    await expect(factory.createPool(zeroAddress)).to.be.reverted;
  });

  it('CreatePool :Can not create pool with the same token twice', async () => {
    const testToken = token.address;
    await factory.createPool(testToken);
    await expect(factory.createPool(testToken)).to.be.reverted;
  });

  
  it('CreatePool: Call token and factory getter on created SwapPool contract', async () => {
    const testToken = token.address;
    const salt = solidityKeccak256(["address"], [testToken]); // keccak256(solidityPack(["address"], [testToken]));
    const initCodeHash = solidityKeccak256(["bytes"], [SwapPool.bytecode]); // keccak256(salt)
    const create2Address = getCreate2Address(factory.address, salt, initCodeHash);
    await factory.createPool(testToken);
    
    // const pool = new Contract(create2Address, JSON.stringify(SwapPool.abi), provider)
    const pool = await ethers.getContractAt("SwapPool", create2Address)
    expect(await pool.token()).to.equal(testToken)
    expect(await pool.factory()).to.equal(factory.address)
  });
  
  it('getPool: Call getPool on Factory contract', async () => {
    const testToken = token.address;
    const pool = await factory.createPool(testToken);
    const contract = await factory.getPool(testToken);
    Promise.resolve(() => expect(pool).to.equal(contract));
  });
});