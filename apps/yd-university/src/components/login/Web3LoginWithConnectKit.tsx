// components/Web3LoginWithConnectKit.tsx
"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectKitButton } from "connectkit";

const Web3LoginWithConnectKit = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<"connect" | "agree" | "sign">("connect");

  // 当连接状态变化时，更新步骤
  const handleConnectedChange = () => {
    if (isConnected && step === "connect") {
      setStep("agree");
    }
  };

  // 用户同意服务条款
  const handleAgreeTerms = () => {
    setAgreedToTerms(true);
    setStep("sign");
  };

  const handleSignIn = async () => {
    if (!address || !agreedToTerms) return;

    try {
      setIsLoading(true);
      setError("");

      // 注意：如果你在本地运行 Nest.js 后端，确保它的端口设置正确
      const API_BASE_URL = "http://localhost:3001";

      console.log("正在获取 nonce...");
      // 1. 获取 nonce
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/nonce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error(`无法连接到后端服务: ${err.message}`);
      });

      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        throw new Error(`获取 nonce 失败 (${nonceResponse.status}): ${errorText}`);
      }

      const { nonce } = await nonceResponse.json();
      console.log("获取到 nonce:", nonce);

      // 2. 创建签名消息
      const message = `一灯教育 Web3 登录\n\n地址: ${address}\nNonce: ${nonce}`;

      console.log("请求用户签名...");
      // 3. 请求用户签名
      const signature = await signMessageAsync({ message });
      console.log("获取到签名:", signature.substring(0, 10) + "...");

      console.log("验证签名...");
      // 4. 验证签名并登录
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature, message }),
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error(`无法连接到后端服务: ${err.message}`);
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`验证签名失败 (${verifyResponse.status}): ${errorText}`);
      }

      const { access_token } = await verifyResponse.json();
      console.log("登录成功，获取到令牌");

      // 5. 存储 token
      localStorage.setItem("auth_token", access_token);

      // 6. 导航到仪表板或刷新状态
      router.push("/");
    } catch (err) {
      console.error("登录失败:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err
        ? (err as Error).message
        : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 监听连接状态变化
  if (isConnected && step === "connect") {
    handleConnectedChange();
  }

  return (
    <div className="backdrop-blur-sm bg-[#1e1e2d]/60 p-6 rounded-xl border border-gray-700 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Web3 钱包登录</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {step === "connect" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-300 text-center mb-2">连接您的钱包以进行登录</p>
            <ConnectKitButton />
          </div>
        )}

        {step === "agree" && isConnected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center bg-[#2a2a3d] p-3 rounded-lg mb-2">
              <span className="text-gray-300">已连接: {address?.substring(0, 6)}...{address?.substring(address?.length - 4)}</span>
            </div>

            <div className="bg-[#2a2a3d]/50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">服务条款</h3>
              <p className="text-gray-400 text-sm mb-4">
                通过点击"同意并登录"按钮，您同意一灯教育的服务条款和隐私政策。您的数字签名将用于验证您的身份，但不会被用于进行任何区块链交易。
              </p>

              <button
                onClick={handleAgreeTerms}
                className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
              >
                同意并继续
              </button>
            </div>

            <button
              onClick={() => disconnect()}
              className="text-sm text-gray-400 hover:text-white"
            >
              断开连接
            </button>
          </div>
        )}

        {step === "sign" && isConnected && agreedToTerms && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center bg-[#2a2a3d] p-3 rounded-lg mb-2">
              <span className="text-gray-300">已连接: {address?.substring(0, 6)}...{address?.substring(address?.length - 4)}</span>
            </div>

            <p className="text-gray-300 text-center">
              请在钱包中签名消息以完成登录流程
            </p>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
            >
              {isLoading ? "签名中..." : "使用钱包签名登录"}
            </button>

            <button
              onClick={() => disconnect()}
              className="text-sm text-gray-400 hover:text-white"
            >
              断开连接
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Web3LoginWithConnectKit;