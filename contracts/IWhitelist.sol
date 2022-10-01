// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWhitelist {

    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) external view returns (bool verified);
    function safeMint(bytes32[] calldata _merkleProof, uint64 maxAllowanceToMint) external;
}