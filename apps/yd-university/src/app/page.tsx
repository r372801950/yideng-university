"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import { Course } from "../types/contracts";

const MOCK_COURSES: Course[] = [
  {
    web2CourseId: "web3-fundamentals",
    name: "Web3 Fundamentals",
    price: BigInt(150),
    isActive: true,
    creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  },
  {
    web2CourseId: "solidity-beginner",
    name: "Solidity for Beginners",
    price: BigInt(200),
    isActive: true,
    creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  },
  {
    web2CourseId: "defi-masterclass",
    name: "DeFi Masterclass",
    price: BigInt(300),
    isActive: true,
    creator: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
  },
  {
    web2CourseId: "nft-development",
    name: "NFT Development Workshop",
    price: BigInt(250),
    isActive: true,
    creator: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
  },
  {
    web2CourseId: "dapp-architecture",
    name: "DApp Architecture & Best Practices",
    price: BigInt(180),
    isActive: true,
    creator: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
  },
  {
    web2CourseId: "smart-contract-security",
    name: "Smart Contract Security",
    price: BigInt(350),
    isActive: true,
    creator: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
  },
  {
    web2CourseId: "blockchain-scaling",
    name: "Blockchain Scaling Solutions",
    price: BigInt(220),
    isActive: true,
    creator: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
  },
  {
    web2CourseId: "ethereum-layer2",
    name: "Ethereum Layer 2 Development",
    price: BigInt(280),
    isActive: true,
    creator: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
  },
  {
    web2CourseId: "web3-frontends",
    name: "Building Web3 Frontends",
    price: BigInt(190),
    isActive: true,
    creator: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"
  },
  {
    web2CourseId: "crypto-economics",
    name: "Crypto Economics Introduction",
    price: BigInt(150),
    isActive: false,
    creator: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"
  }
];

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [account, setAccount] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [ethAmount, setEthAmount] = useState<string>("");
  const [ydBalance, setYdBalance] = useState<number>(0);

  useEffect(() => {
    setCourses(MOCK_COURSES.filter((c) => c.isActive));
  }, []);

  const handleRecharge = async () => {
    if (!account) {
      alert(t("pleaseConnectWallet"));
      return;
    }
    if (!ethAmount || Number(ethAmount) <= 0) {
      alert("Please enter a valid ETH amount");
      return;
    }
    const eth = Number(ethAmount);
    const yd = eth * 1000;
    setYdBalance((prev) => prev + yd);
    setEthAmount("");
    alert(`Successfully recharged ${yd} YD (Mock)!`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto pt-20 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Welcome module - Left side */}
          <div className="flex flex-col justify-center order-2 md:order-1">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-[#4CAF50] mb-3"
          >
            {t("home.welcome")}
          </motion.h3>
          <p className="text-gray-400 mb-6">
            {t("home.welcomeDescription")}
          </p>
          <div className="flex space-x-8">
            <div className="text-center">
            <span className="text-2xl font-semibold text-white block">
              50+
            </span>
            <p className="text-sm text-gray-400">{t("home.courses")}</p>
            </div>
            <div className="text-center">
            <span className="text-2xl font-semibold text-white block">
              24/7
            </span>
            <p className="text-sm text-gray-400">{t("home.support")}</p>
            </div>
            <div className="text-center">
            <span className="text-2xl font-semibold text-white block">
              1000+
            </span>
            <p className="text-sm text-gray-400">
              {t("home.students")}
            </p>
            </div>
          </div>
          </div>
          
          {/* Recharge module - Right side */}
          <div className="recharge-card backdrop-blur-sm bg-[#1e1e2d]/60 p-6 rounded-xl border border-gray-700 order-1 md:order-2">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-white">
                {t("wallet.buyTokens")}
              </h3>
              <span className="text-sm px-3 py-1 bg-[#4CAF50]/20 rounded-full text-[#4CAF50]">
                {t("wallet.balance")}: {ydBalance} {t("currency")}
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
                  onChange={(e) =>
                    setEthAmount(e.target.value)
                  }
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
                  value={
                    ethAmount ? Number(ethAmount) * 1000 : 0
                  }
                  disabled
                  className="w-full bg-[#3A3A4E] text-white p-3 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={handleRecharge}
              className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
            >
              {t("wallet.buyNow")}
            </button>
          </div>
          </div>
        </div>

        {/* Course list */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            {t("home.popularCourses")}
          </h2>
          <p className="text-gray-400 mb-4">
            {t("home.findCourses")}
          </p>
          <div className="flex items-center justify-center">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent w-full max-w-[600px]"></div>
          </div>
        </div>
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.15 }}
          >
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 12px 24px rgba(76, 175, 80, 0.15)",
                }}
                className="transform transition-all duration-300 backdrop-blur-sm bg-[#1e1e2d]/60 border border-gray-700 hover:border-[#4CAF50]/50 rounded-xl overflow-hidden shadow-lg hover:shadow-[#4CAF50]/20"
              >
                <CourseCard course={course} account={account} />
              </motion.div>
            ))}
            {courses.length === 0 && (
              <motion.div 
                className="col-span-3 text-center py-16 backdrop-blur-sm bg-[#1e1e2d]/40 rounded-xl border border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-400 text-lg">
                  {t("home.noCourses")}
                </p>
                <button className="mt-4 px-6 py-2 bg-[#4CAF50]/20 hover:bg-[#4CAF50]/30 text-[#4CAF50] rounded-full transition-all">
                  {t("home.refreshCourses")}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
        
    </div>
  );
};

export default Home;
