import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Course } from "../types/contracts";
import BuyButton from "./BuyButton";

interface CourseCardProps {
    course: Course;
    account: string | null;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, account }) => {
    const { t } = useTranslation();
    const [purchasing, setPurchasing] = useState(false);

    const buyCourse = async () => {
        if (!account) {
            alert(t("pleaseConnectWallet"));
            return;
        }
        setPurchasing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPurchasing(false);
        alert(t("coursePurchasedSuccessfully"));
    };

    const priceInYD = Number(course.price) / 10 ** 18;

    return (
        <div className="card flex flex-col bg-white shadow-sm hover:shadow-lg p-5 rounded-xl transition-all duration-300 border-t border-l border-indigo-50">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400 font-medium">
                    {new Date("2024-12-26").toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-full">
                    <span className="text-amber-500">★</span>
                    <span className="text-xs font-medium text-gray-700">
                        4.8
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-800">
                {course.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-light">
                {course.web2CourseId}
            </p>

            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                <span className="text-base font-semibold text-indigo-600">
                    {priceInYD} {t("currency")}
                </span>
                <BuyButton
                    onClick={buyCourse}
                    purchasing={purchasing}
                    className="group bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-70 flex items-center justify-center"
                />
            </div>
        </div>
    );
};

export default CourseCard;
