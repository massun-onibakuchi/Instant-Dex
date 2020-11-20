import { waffle, ethers } from "hardhat";
import { Contract } from "ethers";

import SwapPool from '../../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicToken from '../../artifacts/contracts/BasicToken.sol/BasicToken.json';
import Factory from '../../artifacts/contracts/Factory.sol/Factory.json';

const { deployContract, } = waffle;

interface PoolFixture {
    factory: Contract
    token: Contract
    pool: Contract
}

export async function poolFixture([wallet, other], provider): Promise<PoolFixture> {
    const token = await deployContract(wallet, BasicToken, [1000]);
    const factory = await deployContract(wallet, Factory);
    await factory.createPool(token.address);
    const poolAddress = await factory.getPool(token.address);
    // const pool = await ethers.getContractAt(SwapPool.abi, poolAddress, wallet);
    // const pool = new ethers.Contract(poolAddress, JSON.stringify(SwapPool.abi), provider).connect(wallet)
    const pool = new Contract(poolAddress, JSON.stringify(SwapPool.abi), provider).connect(wallet)
    return { factory, token, pool }
}
