// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract EftokenContract is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {
    constructor() ERC20("CROAK", "CROAK") ERC20Permit("eftoken") {
        _mint(msg.sender, 2015000000 * 10 ** decimals());
    }

    function FrogPond() public pure returns (string memory) {
        return "CROOOOAK_TESE";
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}

// 0xEc79194C25dbCfc2cb83B66bF770F3396c5CC5C4