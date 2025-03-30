'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectKitButton } from 'connectkit';
import YiDengTokenABI from '@/abis/YiDengToken.json';
import { useAccount } from 'wagmi';

// 合约地址 - 需要替换为实际部署的合约地址
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_YI_DENG_CONTRACT_ADDRESS;

export default function YiDengTokenBuyerClient() {
  const [ethAmount, setEthAmount] = useState<string>('');
  const [expectedTokens, setExpectedTokens] = useState<string>('0');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [remainingSupply, setRemainingSupply] = useState<string>('0');
  const [userBalance, setUserBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  // 使用wagmi的useAccount hook获取连接状态和地址
  const { address, isConnected } = useAccount();

  // 获取合约信息
  const getContractInfo = async (userAddress: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, YiDengTokenABI.abi, provider);

      // 获取代币基本信息
      const name = await contract.name();
      const symbol = await contract.symbol();
      const tokensPerEth = await contract.TOKENS_PER_ETH();
      const remaining = await contract.remainingMintableSupply();
      const balance = await contract.balanceOf(userAddress);

      setTokenName(name);
      setTokenSymbol(symbol);
      setRemainingSupply(remaining.toString());
      setUserBalance(balance.toString());

      // 设置代币兑换率
      if (ethAmount) {
        updateExpectedTokens(ethAmount, tokensPerEth);
      }
    } catch (err: any) {
      console.error('获取合约信息错误:', err);
      setError('获取合约信息失败: ' + (err.message || String(err)));
    }
  };

  // 更新预期获得的代币数量
  const updateExpectedTokens = (amount: string, tokensPerEth?: any) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setExpectedTokens('0');
      return;
    }

    try {
      // 1 ETH = 1000 YD (根据合约)
      const tokens = parseFloat(amount) * (tokensPerEth || 1000);
      setExpectedTokens(tokens.toString());
    } catch (err) {
      console.error('计算代币数量错误:', err);
      setExpectedTokens('0');
    }
  };

  // 处理输入金额变化
  const handleEthAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEthAmount(value);

    // 更新预期获得的代币数量
    updateExpectedTokens(value);
  };

  // 购买代币
  const buyTokens = async () => {
    if (!ethAmount || isNaN(Number(ethAmount)) || parseFloat(ethAmount) <= 0) {
      setError('请输入有效的ETH金额');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, YiDengTokenABI.abi, signer);

      // 调用合约的buyWithETH函数
      const tx = await contract.buyWithETH({
        value: ethers.utils.parseEther(ethAmount),
      });

      setTxHash(tx.hash);

      // 等待交易确认
      await tx.wait();

      // 刷新用户余额
      const balance = await contract.balanceOf(address);
      setUserBalance(balance.toString());

      setIsLoading(false);

      // 清空输入
      setEthAmount('');
      setExpectedTokens('0');
    } catch (err: any) {
      console.error('购买代币错误:', err);
      setIsLoading(false);
      setError('购买失败: ' + (err.message || String(err)));
    }
  };

  // 当钱包连接状态或地址变化时获取合约信息
  useEffect(() => {
    if (isConnected && address) {
      getContractInfo(address);
    }
  }, [isConnected, address]);

  // 渲染UI
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">{tokenName || '一灯币'} ({tokenSymbol || 'YD'}) 购买界面</h1>

      <div className="flex justify-center mb-6">
        {/*todo 统一按钮在标题头部*/}
        <ConnectKitButton />
      </div>

      {isConnected ? (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">已连接账户: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</p>
            <p className="text-sm text-gray-600 mb-1">当前持有 {userBalance} {tokenSymbol}</p>
            <p className="text-sm text-gray-600 mb-1">剩余供应量: {remainingSupply} {tokenSymbol}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ethAmount">
              ETH 数量:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="ethAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="输入ETH数量"
              value={ethAmount}
              onChange={handleEthAmountChange}
            />
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              预计获得: <span className="font-bold">{expectedTokens}</span> {tokenSymbol}
            </p>
            <p className="text-xs text-gray-500">
              (1 ETH = 1000 {tokenSymbol})
            </p>
          </div>

          <button
            onClick={buyTokens}
            disabled={isLoading || !ethAmount}
            className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading || !ethAmount
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? '交易处理中...' : `购买${tokenSymbol}`}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">错误: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {txHash && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">交易已提交! </strong>
              <span className="block sm:inline">
                交易哈希: {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-4">
          <p>请连接钱包以购买一灯币</p>
        </div>
      )}
    </div>
  );
}