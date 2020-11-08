import { run, ethers } from "hardhat";

async function main() {
    await run("compile");

    const accounts = await ethers.getSigners();
    console.log("Accounts:", accounts.map(a => a.address));

    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    await factory.deployed();

    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    await weth.deployed();

    const TransferHelper = await ethers.getContractFactory("TransferHelper");
    const transferLib = await TransferHelper.deploy();
    await transferLib.deployed();

    const Periphery = await ethers.getContractFactory("Periphery");
    const periphery = await Periphery.deploy(weth.address, factory.address);
    await periphery.deployed();

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });