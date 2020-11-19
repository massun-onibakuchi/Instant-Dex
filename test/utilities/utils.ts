import { waffle, ethers } from "hardhat";
import { Contract } from "ethers";

import SwapPool from '../../artifacts/contracts/SwapPool.sol/SwapPool.json';
import BasicToken from '../../artifacts/contracts/BasicToken.sol/BasicToken.json';
import Factory from '../../artifacts/contracts/Factory.sol/Factory.json';

const { deployContract, } = waffle;

async function fixture([wallet, other], provider) {
    const token = await deployContract(wallet, BasicToken, [
        wallet.address, 1000
    ]);
    const factory = await deployContract(wallet, Factory);
    await factory.createPool(token.address);
    const poolAddress = await factory.getPool(token.address)
    const pool = new Contract(poolAddress, JSON.stringify(SwapPool.abi), provider).connect(wallet)
    return { factory, token, pool }
}
