import {ethers} from "hardhat";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");


async function main() {

    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UniSwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    //this is where the impersonation happens
    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", WETHAddress);

    const ROUTER = await ethers.getContractAt("IUniSwap", UniSwapRouter);

    const DAIAmountOut = ethers.parseUnits("20000000000000000000000", 18);

    const daiTx =
        await DAI.connect(impersonatedSigner).approve(UniSwapRouter, DAIAmountOut);
    await daiTx.wait();

    //TO GET THE ETHER BALANCE
    console.log("ETH Balance:", ethers.formatUnits(
        await impersonatedSigner.provider.getBalance(USDCHolder), 18));
    console.log("WETH Balance:", ethers.formatUnits(
        await WETH.balanceOf(impersonatedSigner.address), 18));
    console.log("USDC Balance:", ethers.formatUnits(
        await USDC.balanceOf(impersonatedSigner.address), 6))
    console.log("DAI Balance:", ethers.formatUnits(
        await DAI.balanceOf(impersonatedSigner.address), 18));

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    //THIS IS WHERE THE INTERACTION WITH MAIN NET IS HAPPENING
    const swapTx = await ROUTER.connect(impersonatedSigner).addLiquidityETH(
        DAIAddress,
        DAIAmountOut,
        0,
        0,
        impersonatedSigner.address,
        deadline,
        {value: ethers.parseEther("20")}
    );
    await swapTx.wait();


    console.log("-----------------------------------------------------------------")

    console.log("ETH Balance After Swap", ethers.formatUnits(
        await impersonatedSigner.provider.getBalance(USDCHolder), 18));
    console.log("WETH Balance After Swap", ethers.formatUnits(
        await WETH.balanceOf(impersonatedSigner.address), 18));
    console.log("USDC Balance After Swap", ethers.formatUnits(
        await USDC.balanceOf(impersonatedSigner.address), 6));
    console.log("DAI Balance After Swap", ethers.formatUnits(
        await DAI.balanceOf(impersonatedSigner.address), 18));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
