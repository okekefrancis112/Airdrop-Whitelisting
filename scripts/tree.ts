import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address: any, spots: number) {
    return ethers.utils.defaultAbiCoder.encode(
      ["address", "uint64"],
      [address, spots]
    );
  }

async function main() {

    const [
        address1,
        address2,
        address3,
        address4,
        address5,
        address6,
        address7,
        address8,
        address9,
        address10,
      ] = [
        "0x23d5C0bAdf63ff6422B5B9310211d9BcE147e720",
        "0x2DBdd859D9551b7d882e9f3801Dbb83b339bFFD7",
        "0x9ee15CF9EC4B3830bBedA501d85F5329Ea3C595C",
        "0x85f20a6924A61904AB44243C7e2c771B3bE46734",
        "0x88538EE7D25d41a0B823A7354Ea0f2F252AD0fAf",
        "0x5D63564EeF4657F360343196A7bd86ae18d3a92A",
        "0x12896191de42EF8388f2892Ab76b9a728189260A",
        "0x924843c0c1105b542c7e637605f95F40FD07b4B0",
        "0xB632cAf3119860599ce162Fad8753fc4198037b4",
        "0x414F7137BF842F29cA0f77bF7007F788692F0766",
      ];

    //    await helpers.impersonateAccount(BAholder);
//   const Signer = await ethers.getSigner(BAholder);

//impersonating admin accounts with ethers.getImpersonatedSigner method
await helpers.impersonateAccount(address1);
await helpers.impersonateAccount(address2);
await helpers.impersonateAccount(address3);
await helpers.impersonateAccount(address4);
await helpers.impersonateAccount(address5);
await helpers.impersonateAccount(address6);
await helpers.impersonateAccount(address7);
await helpers.impersonateAccount(address8);
await helpers.impersonateAccount(address9);
await helpers.impersonateAccount(address10);

  const Signer1 = await ethers.getSigner(address1);
  const Signer2 = await ethers.getSigner(address2);
  const Signer3 = await ethers.getSigner(address3);
  const Signer4 = await ethers.getSigner(address4);
  const Signer5 = await ethers.getSigner(address5);
  const Signer6 = await ethers.getSigner(address6);
  const Signer7 = await ethers.getSigner(address7);
  const Signer8 = await ethers.getSigner(address8);
  const Signer9 = await ethers.getSigner(address9);
  const Signer10 = await ethers.getSigner(address10);

  const addressList = [
    encodeLeaf(Signer1.address, 2),
    encodeLeaf(Signer2.address, 2),
    encodeLeaf(Signer3.address, 2),
    encodeLeaf(Signer4.address, 2),
    encodeLeaf(Signer5.address, 2),
    encodeLeaf(Signer6.address, 2),
    encodeLeaf(Signer7.address, 2),
    encodeLeaf(Signer8.address, 2),
    encodeLeaf(Signer9.address, 2),
    encodeLeaf(Signer10.address, 2),
  ];

  const merkleTree = new MerkleTree(addressList, keccak256, {
    hashLeaves: true,
    sortPairs: true,
  });

  const merkleRoot = merkleTree.getHexRoot();

  console.log("Merkle tree: ", merkleTree.toString());
  // console.log("Merkle root: ", merkleRoot);

  const Whitelist = await ethers.getContractFactory("Whitelist");
  const whitelist = await Whitelist.deploy(merkleRoot);
  const  list = await whitelist.deployed();
  console.log("Whitelist Address successfully deployed >>>>>>>", list.address);

  const listed = await ethers.getContractAt("IWhitelist", list.address);
//   const Bet =  await Staking.connect(Signer).stake(amountOut);

const leaf = keccak256(addressList[0]);
const proof = merkleTree.getHexProof(leaf);
console.log("Merkle tree proof ==================================", proof);


let verifiedList = await listed.checkInWhitelist(proof, 2);
// await verifiedList.wait();
console.log("VERIFIED LIST: ", verifiedList);

let minted = await listed.safeMint(proof, 2);
await minted.wait();
console.log("MINTED Token: ", minted);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  