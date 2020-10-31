require("@nomiclabs/hardhat-waffle");

const PROJECT_ID = "";
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",//rinkeby
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    // rinkeby: {
    //   url: "https://rinkeby.infura.io/v3/" + PROJECT_ID,
    // accounts: [privateKey1, privateKey2]
    //   // accounts: {
    //   //   mnemonic:"",
    //   //   path:"",
    //   //   initialIndex:0,
    //   //   count:10
    //   // }
    //   //https://hardhat.org/config/#hd-wallet-config
    // }
  },
  solidity: {
    compilers: [
      {
        version: "0.5.5"
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}
