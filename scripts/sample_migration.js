"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    await hardhat_1.run("compile");
    const accounts = await hardhat_1.ethers.getSigners();
    console.log("Accounts:", accounts.map(a => a.address));
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=sample_migration.js.map