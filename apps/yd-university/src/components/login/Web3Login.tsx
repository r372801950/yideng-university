// components/Web3Login.tsx
"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

const Web3Login = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    try {
      // 使用 injected 连接器 (MetaMask)
      connect({ connector: injected() });
    } catch (err) {
      console.error("连接钱包失败:", err);
      setError("连接钱包失败，请确保已安装MetaMask");
    }
  };

  const handleSignIn = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError("");

      // 1. 获取 nonce
      const nonceResponse = await fetch("http://localhost:3001/auth/nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!nonceResponse.ok) {
        throw new Error("获取 nonce 失败");
      }

      const { nonce } = await nonceResponse.json();

      // 2. 创建签名消息
      const message = `一灯教育 Web3 登录\n\n地址: ${address}\nNonce: ${nonce}`;

      // 3. 请求用户签名
      const signature = await signMessageAsync({ message });

      // 4. 验证签名并登录
      const verifyResponse = await fetch("http://localhost:3001/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature, message }),
      });

      if (!verifyResponse.ok) {
        throw new Error("验证签名失败");
      }

      const { access_token } = await verifyResponse.json();

      // 5. 存储 token
      localStorage.setItem("auth_token", access_token);

      // 6. 导航到仪表板或刷新状态
      router.push("/dashboard");
    } catch (err) {
      console.error("登录失败:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err
        ? (err as Error).message
        : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-sm bg-[#1e1e2d]/60 p-6 rounded-xl border border-gray-700 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Web3 钱包登录</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
        >
          连接钱包
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#2a2a3d] p-3 rounded-lg">
            <span className="text-gray-300">已连接: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
            <button
              onClick={() => disconnect()}
              className="text-sm text-gray-400 hover:text-white"
            >
              断开
            </button>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
          >
            {isLoading ? "登录中..." : "使用钱包签名登录"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Web3Login;