const{ethers,network}=require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")


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
  await balloons.approve(dex.address, ethers.utils.parseEther("100"));
}

module.exports.tags=["Balloons","dex","all"];