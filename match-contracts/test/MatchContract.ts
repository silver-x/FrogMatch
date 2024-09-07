import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";


describe("MatchContract", function () {
  async function deployMatchGame() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Match = await hre.ethers.getContractFactory("MatchContract");
    const match = await Match.deploy("0xEc79194C25dbCfc2cb83B66bF770F3396c5CC5C4")
    return { match, owner, otherAccount};
  }

  describe("Deployment", async function () {
    // const { match, owner, otherAccount } = await loadFixture(deployMatchGame);
    // it("address", async function () {
    //   const { match, owner, otherAccount } = await loadFixture(deployMatchGame);
    // });
    
    it("game", async function () {
      const { match, owner, otherAccount } = await loadFixture(deployMatchGame);
      await match.getPlayer();
      await match.buyBox(1,1);
      await match.getPlayer();
      console.log("-----------------------------------------------------------------------------");
      await match.openBox([4,
        3,
        9,
        3,
        7,
        6,
        5,
        8,
        2]);
      await match.getPlayer();
      console.log("-----------------------------------------------------------------------------");
      await match.openBox([4,
        3,
        9,
        3,
        7,
        6,
        5,
        8,
        2]);
      await match.getPlayer();
      console.log("-----------------------------------------------------------------------------");
    });

    // it("withdraw", async function () {
    //   const { match, owner, otherAccount } = await loadFixture(deployMatchGame);
    //   await match.withdraw();
    // });

    // it("getTestTokens", async function () {
    //   const { match, owner, otherAccount } = await loadFixture(deployMatchGame);
    //   await match.getTestTokens();
    // });

    // randomInt(1000000000)
  });

});

export function randomInt(max:number) {
  const random = Math.trunc(Math.random()*max);
  return random;
}
