# Simplified Token Trade Contract
Extremely simpilified Uniswap-like contract

## Contracts
***Factory***   
The Factory contract to create ***SwapPool*** contracts. This contract create new pools specific to ERC20 token.

***SwapPool***      
The Pool contract. This contract mint liquidity token *RToken* to liquidity provider, also burn and send tokens.

***Periphery***   
User interacts the *Periphery* contract instead of calling Factory or SwapPool Contract directly. This contract interact with other contracts. 

## Installation
`npm install ` 

## Typechain
If you want to create Typechain artifacts for ethers v5,run:
`npm run typechain`

## Testing
`npm test `