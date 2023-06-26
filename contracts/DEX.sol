pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract DEX {
    error DEX__Liquidised();
    error DEX__TransactionFailed();
    error DEX__zeroeth();
    error DEX__zerotoken();
    error DEX__ethtotokenswap();
    error DEX__notokentransferred();
    error DEX__noethswapped();
    error DEX__insufficientliquidity();

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;
    IERC20 token;

    event EthToTokenSwap(address swapper, string txDetails, uint256 ethInput, uint256 indexed tokenOutput);
    event TokenToEthSwap(address swapper, string txDetails, uint256 tokensInput, uint256 indexed ethOutput);
    event LiquidityProvided(address liquidityProvider, uint256 indexed liquidityMinted, uint256 ethInput, uint256 indexed tokensInput);
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 tokensOutput,
        uint256 ethOutput,
        uint256 liquidityWithdrawn
    );

    constructor(address _token){
        token = IERC20(_token);
    }

    function init(uint256 tokens) public payable returns (uint256) {
        if (totalLiquidity != 0) revert DEX__Liquidised();
        totalLiquidity = address(this).balance;
        liquidity[msg.sender] = totalLiquidity;
        if (!token.transferFrom(msg.sender, address(this), tokens))
            revert DEX__TransactionFailed();
        return totalLiquidity;
    }

    function price(
        uint256 xInput,
        uint256 xReserves,
        uint256 yReserves
    ) public pure returns (uint256 yOutput) {
        uint256 xInputWithFee = xInput * 997;
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return (numerator / denominator);
    }

    function ethToToken() public payable returns (uint256) {
        if(msg.value <= 0) revert DEX__zeroeth();
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 tokenOutput = price(msg.value, ethReserve, token_reserve);

        if(!token.transfer(msg.sender, tokenOutput))revert DEX__ethtotokenswap(); 
        emit EthToTokenSwap(msg.sender, "Eth to Balloons", msg.value, tokenOutput);
        return tokenOutput;
    }

    function tokenToEth(uint256 tokenInput) public returns (uint256) {
        if(tokenInput<=0)revert DEX__zerotoken();
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 ethOutput = price(tokenInput, token_reserve, address(this).balance);
        if(!token.transferFrom(msg.sender, address(this), tokenInput))
            revert DEX__notokentransferred();
        (bool sent, ) = msg.sender.call{ value: ethOutput }("");
        if(!sent) revert DEX__noethswapped();
        emit TokenToEthSwap(msg.sender, "Balloons to ETH", tokenInput,ethOutput);
        return ethOutput;
    }

      function deposit() public payable returns (uint256 tokensDeposited) {
        if(msg.value <= 0) revert DEX__zeroeth();
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokenDeposit;

        tokenDeposit = (msg.value * tokenReserve / ethReserve) + 1;

        uint256 liquidityMinted = msg.value * totalLiquidity / ethReserve;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;
        require(token.transferFrom(msg.sender,address(this), tokenDeposit));
        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenDeposit);
        return tokenDeposit;
    }

    function withdraw(uint256 amount) public returns (uint256 eth_amount, uint256 token_amount) {
        if(liquidity[msg.sender] < amount) revert DEX__insufficientliquidity();
        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethWithdrawn;

        ethWithdrawn = amount * ethReserve / totalLiquidity;

        uint256 tokenAmount = amount * tokenReserve / totalLiquidity;
        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;
        (bool sent, ) = payable(msg.sender).call{ value: ethWithdrawn }("");
        if(!sent) revert DEX__noethswapped();
        require(token.transfer(msg.sender, tokenAmount));
        emit LiquidityRemoved(msg.sender, amount, ethWithdrawn, tokenAmount);
        return (ethWithdrawn, tokenAmount);
    }

}
