const { assert, expect } = require("chai")
const { network, deployments, ethers,getNamedAccounts } = require("hardhat")
describe("DEX unit tests",()=>{
    let deployerr,dex;
    beforeEach(async()=>{
        const {deployer}=await getNamedAccounts();
        deployerr=deployer;
        await deployments.fixture(["DEX"]);
        dex=await ethers.getContract("DEX",deployerr);
    })

    describe("constructor",()=>{

    })

    describe("init",()=>{
        it("total liquidity ",async()=>{
            
        })
    })
})