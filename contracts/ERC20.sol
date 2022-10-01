// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

  import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 


  contract HodlToken is ERC20 {

    //   total supply of hodl token is 100,000,000
      uint256 constant initialSupply = 100000000 * (10 ** 18);

    // mint the tokens
      constructor() ERC20("Fran Token", "FT") {
          _mint(msg.sender, initialSupply );
      }

      function decimals() public view virtual  override returns(uint8){
          return 18;
      }
  }
