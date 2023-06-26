const{ethers}=require("hardhat");

async function e_to_t(){
    const accounts=await ethers.getSigners();
    const depositer=accounts[18];
    const dex = await ethers.getContract("DEX",depositer);
    console.log("Sending eth for token in return-----");
    let response=await dex.ethToToken({value:ethers.utils.parseEther("1")});
    let receipt=await response.wait();
    let tokenout=receipt.events[1].args.tokenOutput;
    console.log("Token out",tokenout.toString());
}

e_to_t()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })