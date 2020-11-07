"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const { deployContract } = hardhat_1.waffle;
const privier = hardhat_1.waffle.provider;
const BasicToken_json_1 = __importDefault(require("../artifacts/contracts/BasicToken.sol/BasicToken.json"));
describe('BasicToken', () => {
    const [wallet, walletTo] = privier.getWallets();
    let token;
    beforeEach(async () => {
        const [owner, addr1] = await hardhat_1.ethers.getSigners();
        let accounts = await hardhat_1.ethers.getSigners();
        token = await deployContract(wallet, BasicToken_json_1.default, [1000]);
        // const BasicToken = await ethers.getContractFactory("BasicToken");
        // token = await BasicToken.deploy(1000);
        // const BasicToken = await ethers.getContractFactory("BasicToken");
        // token = await BasicToken.deploy(1000);
    });
    it('Assigns initial balance', async () => {
        chai_1.expect(await token.balanceOf(wallet.address)).to.equal(1000);
    });
    it('Transfer adds amount to destination account', async () => {
        await token.transfer(walletTo.address, 7);
        chai_1.expect(await token.balanceOf(walletTo.address)).to.equal(7);
    });
    it('Transfer emits event', async () => {
        await chai_1.expect(token.transfer(walletTo.address, 7))
            .to.emit(token, 'Transfer')
            .withArgs(wallet.address, walletTo.address, 7);
    });
    it('Can not transfer above the amount', async () => {
        await chai_1.expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
    });
    it('Can not transfer from empty account', async () => {
        const tokenFromOtherWallet = token.connect(walletTo);
        await chai_1.expect(tokenFromOtherWallet.transfer(wallet.address, 1))
            .to.be.reverted;
    });
    // it('Calls totalSupply on BasicToken contract', async () => {
    //   await token.totalSupply();
    //   expect('totalSupply').to.be.calledOnContract(token);
    // });
    // it('Calls balanceOf with sender address on BasicToken contract', async () => {
    //   await token.balanceOf(wallet.address);
    //   expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
    // });
});
