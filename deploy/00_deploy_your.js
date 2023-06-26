const{ethers,network}=require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports=async({deployments,getNamedAccounts})=>{
    const{deploy}=deployments;
    const { deployer } = await getNamedAccounts();
    const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS
    await deploy("Balloons",{
        from:deployer,
        args: [],
        log:true,
        waitConfirmations: waitBlockConfirmations,
    });

    const balloons = await ethers.getContract("Balloons", deployer);

    await deploy("DEX",{
        from:deployer,
        args:[balloons.address],
        log:true,
        waitConfirmations: waitBlockConfirmations,
    });

    const dex = await ethers.getContract("DEX", deployer);

    let receiver="";
    if (developmentChains.includes(network.name)){
      receiver="0xdD2FD4581271e230360230F9337D5c0430Bf44C0";
    }
    else receiver="0x3F8892a9F7D59bcCa2517a7ECE8346a59ac5495B"
    // await balloons.transfer(
    //     receiver, 
    //     ""+10 * 10 ** 18
    // );

      console.log(
    "Approving DEX (" + dex.address + ") to take Balloons from main account..."
  );
  // If you are going to the testnet make sure your deployer account has enough ETH
  await balloons.approve(dex.address, ethers.utils.parseEther("100"));


  console.log("INIT exchange...");
  await dex.init(ethers.utils.parseEther("1"), {
    value: ethers.utils.parseEther("0.1"),
    gasLimit: 200000,
  });
  
  const arguments=[balloons.address];
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying...")
    await verify(dex.address, arguments);
    // await verify(balloons.address,[]); // verified manually
}

}

module.exports.tags=["Balloons","dex","all"];