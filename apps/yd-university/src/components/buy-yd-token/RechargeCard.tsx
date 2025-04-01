// src/components/buy-yd-token/RechargeCard.tsx
"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  fetchTokenInfoAtom,
  tokenNameAtom,
  tokenSymbolAtom,
  tokensPerEthAtom,
  userBalanceAtom,
  remainingSupplyAtom,
  yiDengTokenAddressAtom
} from '@/store/blockchain';
import YiDengTokenABI from '@/abis/YiDengToken.json';

const RechargeCard = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();

  // Jotai 状态
  const tokenAddress = useAtomValue(yiDengTokenAddressAtom);
  const [tokenName] = useAtom(tokenNameAtom);
  const [tokenSymbol] = useAtom(tokenSymbolAtom);
  const [tokensPerEth] = useAtom(tokensPerEthAtom);
  const [userBalance] = useAtom(userBalanceAtom);
  const [remainingSupply] = useAtom(remainingSupplyAtom);
  const fetchTokenInfo = useSetAtom(fetchTokenInfoAtom);

  // 本地状态
  const [ethAmount, setEthAmount] = useState<string>('');
  const [expectedTokens, setExpectedTokens] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  // 更新预期获得的代币数量
  const updateExpectedTokens = (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setExpectedTokens('0');
      return;
    }

    try {
      // 1 ETH = 1000 YD (根据合约)
      const tokens = parseFloat(amount) * tokensPerEth;
      setExpectedTokens(tokens.toString());
    } catch (err) {
      console.error('计算代币数量错误:', err);
      setExpectedTokens('0');
    }
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
      const contract = new ethers.Contract(tokenAddress, YiDengTokenABI.abi, signer);

      // 调用合约的buyWithETH函数
      const tx = await contract.buyWithETH({
        value: ethers.utils.parseEther(ethAmount),
      });

      setTxHash(tx.hash);

      // 等待交易确认
      await tx.wait();

      // 刷新用户余额
      if (address) {
        await fetchTokenInfo(address);
      }

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
      fetchTokenInfo(address);
    }
  }, [isConnected, address, fetchTokenInfo]);

  // 当输入金额变化时更新预期代币
  useEffect(() => {
    updateExpectedTokens(ethAmount);
  }, [ethAmount]);

  return (
    <div className="recharge-card backdrop-blur-sm bg-[#1e1e2d]/60 p-6 rounded-xl border border-gray-700 order-1 md:order-2">
      {/* UI 部分与之前相同 */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-semibold text-white">
          {t("wallet.buyTokens")}
        </h3>
        <span className="text-sm px-3 py-1 bg-[#4CAF50]/20 rounded-full text-[#4CAF50]">
          {t("wallet.balance")}: {userBalance} {tokenSymbol}
        </span>
      </div>
      <div className="flex items-center space-x-4 mb-5">
        <div className="flex-1">
          <label className="text-sm text-gray-400 block mb-1">
            {t("wallet.youPay")}
          </label>
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-[#3A3A4E] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/50"
          />
        </div>
        <span className="text-gray-400 text-xl">→</span>
        <div className="flex-1">
          <label className="text-sm text-gray-400 block mb-1">
            {t("wallet.youGet")}
          </label>
          <input
            type="number"
            value={expectedTokens}
            disabled
            className="w-full bg-[#3A3A4E] text-white p-3 rounded-lg"
          />
        </div>
      </div>
      <button
        onClick={buyTokens}
        disabled={isLoading || !ethAmount}
        className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
      >
        {isLoading ? '交易处理中...' : t("wallet.buyNow")}
      </button>
    </div>
  );
};

export default RechargeCard;