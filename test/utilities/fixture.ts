import { waffle } from "hardhat";
import { Contract } from "ethers";

import SwapPoolArtifact from '../../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicTokenArtifact from '../../artifacts/contracts/BasicToken.sol/BasicToken.json';
import FactoryArtifact from '../../artifacts/contracts/Factory.sol/Factory.json';

import { SwapPool } from "../../typechain/SwapPool";
import { BasicToken } from "../../typechain/BasicToken";
import { Factory } from "../../typechain/Factory";

const { deployContract } = waffle;

interface PoolFixture {
    factory: Factory
    token: BasicToken
    pool: SwapPool
}

export async function poolFixture([wallet, other], provider): Promise<PoolFixture> {
    const token = (await deployContract(wallet, BasicTokenArtifact, [1000])) as BasicToken;
    const factory = (await deployContract(wallet, FactoryArtifact)) as Factory;
    await factory.createPool(token.address);
    const poolAddress = await factory.getPool(token.address);
    // const pool = await ethers.getContractAt(SwapPool.abi, poolAddress, wallet);
    // const pool = new ethers.Contract(poolAddress, JSON.stringify(SwapPool.abi), provider).connect(wallet)
    const pool = (new Contract(poolAddress,
        JSON.stringify(SwapPoolArtifact.abi),
        provider
    ).connect(wallet)) as SwapPool;
    return { factory, token, pool }
}
