"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import YiDengTokenABI from "@/abis/YiDengToken.json";
import CourseMarketABI from "@/abis/CourseMarket.json";
import {motion} from "framer-motion";
import CourseCard from "@/components/course/CourseCard";
import {t} from "i18next";

interface Course {
  id: number;
  web2CourseId: string;
  name: string;
  price: string;
  isActive: boolean;
  creator: string;
  owned: boolean;
}

interface CoursePurchaseProps {
  yiDengTokenAddress: string;
  courseMarketAddress: string;
}

const CoursePurchase = () => {
  const yiDengTokenAddress='0x2021265E02F24fdC424098f2973D7CC792d87AEa', courseMarketAddress='0xE19f6eabb277012834D7cF31F74bF4eeD26DdA95'
  const { address, isConnected } = useAccount();
  const [ydBalance, setYdBalance] = useState<string>("0");// todo jotai
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // 模拟课程数据 - 在实际应用中，这些数据应该从合约中获取
  const mockCourses = [
    { id: 1, web2CourseId: "jiang-test-web2-CourseId0001", name: "Web3 基础知识", price: "150", isActive: true, creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", owned: false },
    { id: 2, web2CourseId: "jiang-test-web2-CourseId0001", name: "Solidity 入门", price: "200", isActive: true, creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", owned: false },
    { id: 3, web2CourseId: "defi-masterclass", name: "DeFi 大师班", price: "300", isActive: true, creator: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", owned: false },
    { id: 4, web2CourseId: "nft-development", name: "NFT 开发工作坊", price: "250", isActive: true, creator: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", owned: false },
  ];

  // 加载用户YD余额和已拥有的课程
  /*const loadUserData = async () => {
    if (!isConnected || !address || !window.ethereum) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(yiDengTokenAddress, YiDengTokenABI.abi, provider);
      const marketContract = new ethers.Contract(courseMarketAddress, CourseMarketABI.abi, provider);



      // 检查用户已拥有的课程
      const updatedCourses = await Promise.all(
        mockCourses.map(async (course) => {
          try {
            const isOwned = await marketContract.hasCourse(address, course.web2CourseId);
            return { ...course, owned: isOwned };
          } catch (err) {
            console.error(`检查课程所有权错误 (${course.web2CourseId}):`, err);
            return { ...course, owned: false };
          }
        })
      );

      setCourses(updatedCourses);
    } catch (err: any) {
      console.error("加载用户数据错误:", err);
      setError(`加载用户数据失败: ${err.message || String(err)}`);
    }
  };*/

  const fetchCourses = async () => {

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const courseMarketContract = new ethers.Contract(
        courseMarketAddress,
        CourseMarketABI.abi,
        provider
      );

      // const tokenContract = new ethers.Contract(yiDengTokenAddress, YiDengTokenABI.abi, provider);
      // // 获取YD余额
      // const balance = await tokenContract.balanceOf(address);
      // setYdBalance(balance.toString());

      // 获取课程总数
      const courseCount = await courseMarketContract.courseCount();

      // 获取所有课程信息
      const coursesList: Course[] = [];

      for (let i = 1; i <= courseCount.toNumber(); i++) {
        const courseData = await courseMarketContract.courses(i);

        // 检查用户是否拥有这个课程
        let isOwned = false;
        if (address) {
          isOwned = await courseMarketContract.hasCourse(address, courseData.web2CourseId);
        }

        const course: Course = {
          id: i,
          web2CourseId: courseData.web2CourseId,
          name: courseData.name,
          price: ethers.utils.formatUnits(courseData.price, 0),
          isActive: courseData.isActive,
          creator: courseData.creator,
          owned: isOwned
        };

        // 只添加激活的课程
        if (course.isActive) {
          coursesList.push(course);
        }
      }

      setCourses(coursesList);
    } catch (err: any) {
      console.error("获取课程列表错误:", err);
      setError("获取课程列表失败: " + (err.message || String(err)));
    }
  };


  // 组件加载和钱包连接变化时获取数据
  useEffect(() => {

    fetchCourses();
    // if (isConnected) {
    //   loadUserData();
    // }
  }, [isConnected, address]);

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
        yiDengTokenAddress,
        YiDengTokenABI.abi,
        signer
      );

      // 授权代币使用
      const tx = await tokenContract.approve(
        courseMarketAddress,
        ethers.utils.parseUnits(coursePrice, 0) // 根据YiDengToken的decimals设置
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
      // 先检查余额是否足够 todo 检查余额 jotai
      // if (BigInt(ydBalance) < BigInt(course.price)) {
      //   setError(`YD余额不足。需要 ${course.price} YD，但您只有 ${ydBalance} YD`);
      //   setIsLoading(false);
      //   return;
      // }

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
        courseMarketAddress,
        CourseMarketABI.abi,
        signer
      );

      // 购买课程
      const tx = await marketContract.purchaseCourse(course.web2CourseId);
      await tx.wait();

      setSuccess(`课程购买成功! 交易哈希: ${tx.hash}`);

      // 刷新数据
      // await loadUserData();
    } catch (err: any) {
      console.error("购买课程错误:", err);
      setError(`购买失败: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      {/*<div className="mb-6 flex justify-between items-center">*/}
      {/*  <h2 className="text-2xl font-bold text-white">课程列表</h2>*/}
      {/*  <div className="text-sm px-3 py-1 bg-[#4CAF50]/20 rounded-full text-[#4CAF50]">*/}
      {/*    YD余额: {ydBalance}*/}
      {/*  </div>*/}
      {/*</div>*/}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6">
          {error}
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
            <button
              // onClick={refreshCourses}
              className="mt-4 px-6 py-2 bg-[#4CAF50]/20 hover:bg-[#4CAF50]/30 text-[#4CAF50] rounded-full transition-all"
            >
              {t("home.refreshCourses")}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CoursePurchase;