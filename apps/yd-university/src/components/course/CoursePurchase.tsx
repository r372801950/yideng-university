"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import CourseCard from "@/components/course/CourseCard";
import { t } from "i18next";
import {
  coursesAtom,
  coursesErrorAtom,
  coursesLoadingAtom,
  fetchCoursesAtom,
  yiDengTokenAddressAtom,
  courseMarketAddressAtom,
  userBalanceAtom,
  fetchTokenInfoAtom
} from "@/store/blockchain";
import YiDengTokenABI from "@/abis/YiDengToken.json";
import CourseMarketABI from "@/abis/CourseMarket.json";
import { Course } from "@/types";

const CoursePurchase = () => {
  const { address, isConnected } = useAccount();

  // Jotai 状态
  const tokenAddress = useAtomValue(yiDengTokenAddressAtom);
  const marketAddress = useAtomValue(courseMarketAddressAtom);
  const userBalance = useAtomValue(userBalanceAtom);
  const [courses] = useAtom(coursesAtom);
  const [isCoursesLoading] = useAtom(coursesLoadingAtom);
  const [coursesError] = useAtom(coursesErrorAtom);
  const fetchCourses = useSetAtom(fetchCoursesAtom);
  const fetchTokenInfo = useSetAtom(fetchTokenInfoAtom);

  // 本地状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // 组件加载和钱包连接变化时获取数据
  useEffect(() => {
    if (window.ethereum) {
      fetchCourses(address);

      if (isConnected && address) {
        fetchTokenInfo(address);
      }
    }
  }, [isConnected, address, fetchCourses, fetchTokenInfo]);

  // 授权YD代币使用
  const approveTokens = async (coursePrice: string) => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return false;
    }

    setIsApproving(true);
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("请安装MetaMask或其他以太坊钱包");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        YiDengTokenABI.abi,
        signer
      );

      // 授权代币使用
      const tx = await tokenContract.approve(
        marketAddress,
        ethers.utils.parseUnits(coursePrice, 0)
      );

      await tx.wait();
      return true;
    } catch (err: any) {
      console.error("授权代币错误:", err);
      setError(`授权失败: ${err.message || String(err)}`);
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  // 购买课程
  const purchaseCourse = async (course: Course) => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 先检查余额是否足够
      if (BigInt(userBalance) < BigInt(course.price)) {
        setError(`YD余额不足。需要 ${course.price} YD，但您只有 ${userBalance} YD`);
        setIsLoading(false);
        return;
      }

      // 授权使用代币
      const approved = await approveTokens(course.price);
      if (!approved) {
        setIsLoading(false);
        return;
      }

      if (!window.ethereum) {
        throw new Error("请安装MetaMask或其他以太坊钱包");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const marketContract = new ethers.Contract(
        marketAddress,
        CourseMarketABI.abi,
        signer
      );

      // 购买课程
      const tx = await marketContract.purchaseCourse(course.web2CourseId);
      await tx.wait();

      setSuccess(`课程购买成功! 交易哈希: ${tx.hash}`);

      // 刷新数据
      fetchCourses(address);
      fetchTokenInfo(address);
    } catch (err: any) {
      console.error("购买课程错误:", err);
      setError(`购买失败: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新课程列表
  const refreshCourses = () => {
    fetchCourses(address);
  };

  return (
    <div className="container mx-auto">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6">
          {error}
        </div>
      )}

      {coursesError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6">
          {coursesError}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg relative mb-6">
          {success}
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, staggerChildren: 0.15 }}
      >
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            isLoading={isLoading}
            isApproving={isApproving}
            onPurchase={purchaseCourse}
          />
        ))}

        {courses.length === 0 && !isCoursesLoading && (
          <motion.div
            className="col-span-3 text-center py-16 backdrop-blur-sm bg-[#1e1e2d]/40 rounded-xl border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-400 text-lg">
              {t("home.noCourses")}
            </p>
            <button
              onClick={refreshCourses}
              className="mt-4 px-6 py-2 bg-[#4CAF50]/20 hover:bg-[#4CAF50]/30 text-[#4CAF50] rounded-full transition-all"
            >
              {t("home.refreshCourses")}
            </button>
          </motion.div>
        )}

        {isCoursesLoading && (
          <motion.div
            className="col-span-3 text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="text-gray-400 mt-4">加载课程中...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CoursePurchase;