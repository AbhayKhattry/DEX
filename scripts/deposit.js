const{ethers}=require("hardhat");

async function deposit(){
    const accounts=await ethers.getSigners();
    const depositer=accounts[18];
    const dex=await ethers.getContract("DEX",depositer);
    const balloons=await ethers.getContract("Balloons",depositer);
    if(depositer!=accounts[0]) await balloons.approve(dex.address, ethers.utils.parseEther("100"));
    console.log("Depositing liquidity------")
    const response=await dex.deposit({value:ethers.utils.parseEther("1")});
    console.log("Deposited.");
    const receipt=await response.wait();
    // console.log(receipt);
    const liquidityminted=(receipt.events[2].args.liquidityMinted).toString();
    const totalliquidity=(await dex.gettotalLiquidity()).toString();
    console.log("liquidity minted --",liquidityminted);
    console.log("totalliquidity --",totalliquidity);

}

deposit()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })