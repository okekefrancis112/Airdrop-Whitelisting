import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const csv = require("csv-parser");
const fs = require("fs");
// var utils = require("ethers").utils;
import "@nomiclabs/hardhat-web3";
// const Web3 = require("web3");


    // create web3 instance (no provider needed)
    // var web3 = new Web3();
    let root;

    ///files for each ardrop
  // import distribution from this file
  const filename = "gen_files/address_sample_dist_list.csv";

    // what file should we write the merkel proofs too?
    const output_file = "gen_files/user_ticket_roots.json";

      //file that has the user claim list
  const userclaimFile = "gen_files/user_claimlist.json";

    // used to store one leaf for each line in the distribution file
    const token_dist:any[] = [];

    // used for tracking user_id of each leaf so we can write to proofs file accordingly
    const user_dist_list:any[] = [];

async function main() {

     // open distribution csv
     fs.createReadStream(filename)
     .pipe(csv())
     .on("data", (row:any) => {
       const user_dist:any[] = [row["user_address"], row["amount"]]; // create record to track user_id of leaves
      //  console.log("user_dist    >>>>>>>>>>>>>>>>>>>>>>", user_dist);
       const leaf_hash:string = ethers.utils.solidityKeccak256(["address", "uint256"], [row["user_address"], row["amount"]] ); // encode base data like solidity abi.encode
       user_dist_list.push(user_dist); // add record to index tracker
       token_dist.push(leaf_hash); // add leaf hash to distribution
       
     })
     .on("end", () => {
      // console.log(">>>>>>>>>>>>>>>>>>>>>>", user_dist_list);
       // create merkle tree from token distribution
       const merkle_tree:any = new MerkleTree(token_dist, keccak256, {
         sortPairs: true,
       });
       // get root of our tree
       root = merkle_tree.getHexRoot();
      //  console.log("root >>>>>>>>>>>>>>>>>>>>>>", root);
       // create proof file
       write_leaves(merkle_tree, user_dist_list, token_dist, root);
     });

            // write leaves & proofs to json file
   async function write_leaves(merkle_tree:string, user_dist_list:any, token_dist:any, root:string) {
      
    console.log("Begin writing leaves to file...");
    let full_dist = {} as any;
    let full_user_claim = {} as any;

        //  Deploying my contract
        const Whitelist = await ethers.getContractFactory("Whitelist");
        const whitelist = await Whitelist.deploy(root);
        const  list = await whitelist.deployed();
        console.log("Whitelist Address successfully deployed >>>>>>>", list.address);
        const listed = await ethers.getContractAt("IWhitelist", list.address);


    for (let line = 0; line < user_dist_list.length; line++) {
      // generate leaf hash from raw data
      const leaf:any[] = token_dist[line];
      // console.log("leaf ======================================", leaf)
      const proof:any[] = merkle_tree.getHexProof(leaf);
      // console.log("proof >>>>>>>>>>>>>>>>>>>>>>>", proof);
      
      // create dist object
      const user_dist = {
        leaf: leaf,
        proof: proof,
      };

      // add record to our distribution
      full_dist[user_dist_list[line][0]] = user_dist;
      let verifiedList = await listed.checkInWhitelist(proof, 2);
      console.log("VERIFIED LIST: ", verifiedList);
      
      let minted = await listed.safeMint(proof, 2);
      await minted.wait();
      console.log("MINTED Token: ", minted);
    }
    

    fs.writeFile(output_file, JSON.stringify(full_dist, null, 4), (err:any) => {
        if (err) {
          console.error(err);
          return;
        }
      
        let dropObjs = {
          dropDetails: {
            // contractAddress: airdropContract,
            contractAddress: list.address,
            merkleroot: root,
          },
        };

        for (let line = 0; line < user_dist_list.length; line++) {
          const other = user_dist_list[line];
          const user_claim = {
            address: other[0],
            itemID: other[1],
            amount: other[2],
          };
          full_user_claim[user_dist_list[line][0]] = user_claim;
        }
      
        let newObj = Object.assign(full_user_claim, dropObjs);
        //append to airdrop list to have comprehensive overview
        fs.writeFile(userclaimFile, JSON.stringify(newObj, null, 4), (err:any) => {
          if (err) {
            console.error(err);
            return;
          }
        });
        console.log(output_file, "has been written with a root hash of:\n", root);
      });

    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
