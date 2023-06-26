const{ethers}=require("hardhat");

async function withdraw(){
    const accounts=await ethers.getSigners();
    const withdrawer=accounts[18];
    const dex=await ethers.getContract("DEX",withdrawer);
    console.log("Withdrawing liquidity------")
    const response=await dex.withdraw(ethers.utils.parseEther("1"));
    console.log("Withdrawn.");
    const receipt=await response.wait();
    // console.log(receipt);
    const liquidityWithdrawn=(receipt.events[1].args.liquidityWithdrawn).toString();
    const totalliquidity=(await dex.gettotalLiquidity()).toString();
    console.log("liquidity withdrawn --",liquidityWithdrawn);
    console.log("totalliquidity --",totalliquidity);

}

withdraw()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })