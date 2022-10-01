// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Whitelist is ERC20 {

    /// @dev this is the merkle root computed from the valid addresses
    bytes32 public merkleRoot;

    /// @dev this mapping would be used to map users to a bool to make sure the user has not claimed before
    mapping(address => bool) airdropTokenClaimed;

    /// @dev the is the address of the NRF token to tbe sent to user
    address claimTokenAddress;
    address admin;

    /// @dev setting the merkle root computed from the valid addresses
    constructor(bytes32 _merkleRoot) ERC20("Airdrop Token", "ADT") {
        merkleRoot = _merkleRoot;
    }

    // EVENT
    event Claimed(address claimer, uint256 amount);

    function checkInWhitelist(bytes32[] calldata proof, uint64 airdropAmount) public view returns (bool verified) {
        require(!airdropTokenClaimed[msg.sender],"Already claimed");
        bytes32 leaf = keccak256(abi.encode(msg.sender, airdropAmount));

        verified = MerkleProof.verify(proof, merkleRoot, leaf);
        verified = true;
    }

    function safeMint(bytes32[] calldata _merkleProof, uint64 airdropAmount) external {

        bool status = checkInWhitelist(_merkleProof, airdropAmount);
        require(status, "Invalid Proof");
        require(airdropTokenClaimed[msg.sender] != status, "You are not eligible");
        _mint(msg.sender, airdropAmount* 10**18);

        // airdropTokenClaimed[msg.sender] += 1;
    }
}