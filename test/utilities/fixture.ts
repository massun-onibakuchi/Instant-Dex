import { waffle } from "hardhat";
import { Contract } from "ethers";

import SwapPoolArtifact from '../../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicTokenArtifact from '../../artifacts/contracts/BasicToken.sol/BasicToken.json';
import FactoryArtifact from '../../artifacts/contracts/Factory.sol/Factory.json';
import WETHArtifact from '../../artifacts/contracts/tests/WETH9.sol/WETH9.json';
import PeripheryArtifact from '../../artifacts/contracts/Periphery.sol/Periphery.json';

import { SwapPool } from "../../typechain/SwapPool";
import { BasicToken } from "../../typechain/BasicToken";
import { Factory } from "../../typechain/Factory";
import { Periphery } from "../../typechain/Periphery";
import { WETH9 as WETH } from "../../typechain/WETH9";

const { deployContract } = waffle;

interface PoolFixture {
    factory: Factory
    token: BasicToken
    pool: SwapPool
}

interface PeripheryFixture {
    factory: Factory
    basicToken: BasicToken
    weth: WETH
    basicPool: SwapPool
    wethPool: SwapPool
    periphery: Periphery
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

export async function peripheryFixture([wallet, other], provider): Promise<PeripheryFixture> {
    const basicToken = (await deployContract(wallet, BasicTokenArtifact, [1000])) as BasicToken;
    const weth = (await deployContract(wallet, WETHArtifact)) as WETH;
    const factory = (await deployContract(wallet, FactoryArtifact)) as Factory;
    await factory.createPool(basicToken.address);
    await factory.createPool(weth.address);

    const basicPool = (new Contract(
        await factory.getPool(basicToken.address),
        JSON.stringify(SwapPoolArtifact.abi),
        provider
    ).connect(wallet)) as SwapPool;

    const wethPool = (new Contract(
        await factory.getPool(weth.address),
        JSON.stringify(SwapPoolArtifact.abi),
        provider
    ).connect(wallet)) as SwapPool;

    const periphery = (await deployContract(wallet, PeripheryArtifact, [weth.address, factory.address])) as Periphery

    return { factory, basicToken, weth, basicPool, wethPool, periphery }
}
