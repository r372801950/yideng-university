import {useState} from "react";
import {useAccount} from "wagmi";

interface TransactionOptions {
  setError?: (message: string) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const useBlockchainInteraction = ()=>{
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 验证钱包和环境
  const validateWallet = (customSetError?: (message: string) => void): boolean => {
    const errorSetter = customSetError || setError;

    if (!isConnected || !address) {
      errorSetter("请先连接钱包");
      return false;
    }

    if (!window.ethereum) {
      errorSetter("请安装MetaMask或其他以太坊钱包");
      return false;
    }

    return true;
  };

  const executeTransaction = async <T>(
    transactionFn:()=>Promise<T>,
    options: TransactionOptions = {}
  )=>{
    const { setError: customSetError, onSuccess, onError } = options;

    if (!validateWallet(customSetError)) {
      return false;
    }
    setIsLoading(true);
    try {
      const result = await transactionFn();
      if (onSuccess) onSuccess(result);
      return result;
    }catch (err) {
      console.error("交易错误:", err);
    }
  }
  return {
    isLoading,
    error,
    setError,
    executeTransaction,
    validateWallet
  }
}