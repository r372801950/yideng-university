"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import RechargeCard from "@/components/buy-yd-token/RechargeCard";
import CoursePurchase from "@/components/course/CoursePurchase";

const Home = () => {
  const { t } = useTranslation();

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
          <RechargeCard />
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
        <CoursePurchase />
    </div>
  );
};

export default Home;
