import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("B3TR", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const B3TR = await ethers.getContractFactory("B3TRMock");
        const b3tr = await B3TR.deploy();

        return { b3tr, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("sets symbol correctly", async function () {
            const { b3tr } = await loadFixture(deployFixture);

            expect(await b3tr.symbol()).to.equal('B3TR');
        });
    });
});