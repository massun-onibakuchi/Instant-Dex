import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Sample", function () {
  let accounts: Signer[];


  beforeEach(async function () {
    const [owner, addr1] = await ethers.getSigners();
    accounts = await ethers.getSigners();
  });

  it("should do something right", async function () {
    // Do something with the accounts
  });
});