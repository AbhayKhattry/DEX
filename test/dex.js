const { assert, expect } = require("chai")
const {deployments, ethers } = require("hardhat")
describe("DEX unit tests",()=>{
    let deployer,dex,balloons,lp;
    beforeEach(async()=>{
        let accounts=await ethers.getSigners();
        deployer=accounts[0];
        lp=accounts[18];
        await deployments.fixture(["dex"]);
        dex=await ethers.getContract("DEX",deployer);
    })
    
    describe("init()",()=>{
        it("checks the correctness of total liquidity",async()=>{
            const liquidity_before=(await dex.totalLiquidity()).toString();
            assert.equal(liquidity_before,"0");
            await dex.init(ethers.utils.parseEther("5"), {
                value: ethers.utils.parseEther("5"),
                gasLimit: 200000,
            });
            const liquidity_after=(await dex.totalLiquidity()).toString();
            assert.equal(liquidity_after,ethers.utils.parseEther("5"));
        });

        it("reverts if total liquidity is not equal to 0 ",async()=>{
            await dex.init(ethers.utils.parseEther("5"), {
                    value: ethers.utils.parseEther("5"),
                    gasLimit: 200000,
                });
                await expect(dex.init(5)).to.be.revertedWith("DEX__Liquidised");
            });
    })
        
    describe("After initialising the contract",()=>{
        beforeEach(async()=>{
            await dex.init(ethers.utils.parseEther("5"), {
                    value: ethers.utils.parseEther("5"),
                    gasLimit: 200000,
                });
        })
        describe("price()",()=>{
            it("checks the price function ",async()=>{
                let xInput = ethers.utils.parseEther("1");
                let xReserves = ethers.utils.parseEther("5");
                let yReserves = ethers.utils.parseEther("5");
                let yOutput = await dex.price(xInput, xReserves, yReserves);
                assert.equal(yOutput.toString(),"831248957812239453");
                xInput = ethers.utils.parseEther("1");
                xReserves = ethers.utils.parseEther("10");
                yReserves = ethers.utils.parseEther("15");
                yOutput = await dex.price(xInput, xReserves, yReserves);
                assert.equal(yOutput.toString(),"1359916340820223697");
            });
        })
    
        describe("ethToToken()",()=>{
            it("Should revert if 0 ETH sent", async()=> {
                await expect(
                    dex.ethToToken({value: ethers.utils.parseEther("0")}
                    )).to.be.revertedWith("DEX__zeroeth");
              });
    
            it("check if correct token is transferred to the sender",async()=>{
                const dexl=await dex.connect(lp);
                let response=await dexl.ethToToken({value:ethers.utils.parseEther("1")});
                let receipt=await response.wait();
                let tokenout=receipt.events[1].args.tokenOutput;
                assert.equal(tokenout.toString(),"831248957812239453");
            })

            it("Should emit event",async()=>{
                await expect(dex.ethToToken({value:ethers.utils.parseEther("1")})).to.emit(dex,"EthToTokenSwap");
            })
        })
        
        describe("tokenToEth()",()=>{
            it("Should revert if 0 token sent", async()=> {
                await expect(
                    dex.tokenToEth(ethers.utils.parseEther("0")
                    )).to.be.revertedWith("DEX__zerotoken");
              });
    
            it("check if correct eth is transferred to the sender",async()=>{
                balloons=await ethers.getContract("Balloons",lp);
                const dexl=await dex.connect(lp);
                await balloons.approve(dexl.address, ethers.utils.parseEther("100"));
                let response=await dexl.tokenToEth(ethers.utils.parseEther("1"));
                let receipt=await response.wait();
                let ethout=receipt.events[2].args.ethOutput;
                assert.equal(ethout.toString(),"831248957812239453");
            })

            it("Should emit event",async()=>{
                await expect(dex.tokenToEth(ethers.utils.parseEther("1"))).to.emit(dex,"TokenToEthSwap");
            })
        })

        describe("desposit()",()=>{
            it("Should revert if 0 ETH sent", async()=> {
                await expect(
                    dex.deposit({value: ethers.utils.parseEther("0")}
                    )).to.be.revertedWith("DEX__zeroeth");
            });

            it("checks the correctness of liquidity minted",async()=>{
                const totalLiquidity_before=(await dex.totalLiquidity());
                balloons=await ethers.getContract("Balloons",deployer);
                await balloons.approve(dex.address, ethers.utils.parseEther("100"));
                await dex.deposit({value:ethers.utils.parseEther("1")});
                const totalLiquidity_after=(await dex.totalLiquidity()).toString();
                assert.equal((totalLiquidity_before.add(ethers.utils.parseEther("1"))).toString(),totalLiquidity_after);
            })

            it("Should emit event",async()=>{
                await expect(dex.deposit({value:ethers.utils.parseEther("1")})).to.emit(dex,"LiquidityProvided");
            })
        })

        describe("withdraw()",()=>{
            it("should revert if liquidity is insufficient for withdrawal",async()=>{
                await expect(dex.withdraw(ethers.utils.parseEther("6"))).to.be.revertedWith("DEX__insufficientliquidity");
            })

            it("checks the correctness of liquidity withdrawn",async()=>{
                const totalLiquidity_before=(await dex.totalLiquidity());
                balloons=await ethers.getContract("Balloons",deployer);
                await dex.withdraw(ethers.utils.parseEther("1"));
                const totalLiquidity_after=(await dex.totalLiquidity()).toString();
                assert.equal((totalLiquidity_before.sub(ethers.utils.parseEther("1"))).toString(),totalLiquidity_after);
            })

            it("Should emit event",async()=>{
                await expect(dex.withdraw(ethers.utils.parseEther("1"))).to.emit(dex,"LiquidityRemoved");
            })
        })
    })
})