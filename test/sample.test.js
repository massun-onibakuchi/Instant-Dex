"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
describe("Token", function () {
    let accounts;
    beforeEach(async function () {
        const [owner, addr1] = await hardhat_1.ethers.getSigners();
        accounts = await hardhat_1.ethers.getSigners();
    });
    it("should do something right", async function () {
        // Do something with the accounts
    });
});
//# sourceMappingURL=sample.test.js.map