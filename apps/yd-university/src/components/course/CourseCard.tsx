// CourseCard.tsx
import { motion } from "framer-motion";
import {CourseCardProps} from "@/types";

const CourseCard = ({ course, index, isLoading, isApproving, onPurchase }: CourseCardProps) => {
  return (
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
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>
        <p className="text-gray-400 mb-4">ID: {course.web2CourseId}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-[#4CAF50]">{course.price} YD</span>
          {course.owned ? (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              已拥有
            </span>
          ) : null}
        </div>

        <div className="text-xs text-gray-500 mt-2 mb-4">
          创建者: {course.creator.substring(0, 6)}...{course.creator.substring(course.creator.length - 4)}
        </div>

        <button
          onClick={() => onPurchase(course)}
          disabled={isLoading || isApproving || course.owned}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            course.owned
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : isLoading || isApproving
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-[#4CAF50] hover:bg-[#3e8e41] text-white"
          }`}
        >
          {course.owned
            ? "已购买"
            : isApproving
              ? "授权中..."
              : isLoading
                ? "购买中..."
                : "购买课程"}
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;