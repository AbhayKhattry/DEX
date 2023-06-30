const{ethers,network}=require("hardhat");
const {
  developmentChains,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports=async({getNamedAccounts})=>{
    const { deployer } = await getNamedAccounts();
    const dex=await ethers.getContract("DEX",deployer);
    console.log("INIT exchange...");
    await dex.init(ethers.utils.parseEther("1"), {
      value: ethers.utils.parseEther("0.1"),
      gasLimit: 200000,
    });
    const balloons = await ethers.getContract("Balloons", deployer);
    const arguments=[balloons.address];
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
      console.log("Verifying...")
      await verify(dex.address, arguments);
      // await verify(balloons.address,[]); // verified manually
  }
  
}
module.exports.tags=["all","init"];