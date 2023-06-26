const{ethers}=require("hardhat");

async function t_to_e(){
    const accounts=await ethers.getSigners();
    const depositer=accounts[18];
    const dex = await ethers.getContract("DEX",depositer);
    const balloons=await ethers.getContract("Balloons",depositer);
    if(depositer!=accounts[0]) await balloons.approve(dex.address, ethers.utils.parseEther("100"));
    console.log("Sending token for eth in return-----");
    let response=await dex.tokenToEth(ethers.utils.parseEther("1"));
    let receipt=await response.wait();
    let ethout=receipt.events[2].args.ethOutput;
    console.log("ETH out",ethout.toString());
}

t_to_e()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })