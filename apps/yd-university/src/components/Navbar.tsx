import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    WalletIcon,
    ArrowRightOnRectangleIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [account, setAccount] = useState<string | null>(null);

    const connectWallet = () => {
        const mockAccount = "0x1234567890abcdef1234567890abcdef12345678";
        setAccount(mockAccount);
    };

    const disconnectWallet = () => setAccount(null);

    const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

    return (
        <nav className="bg-[#1A1A2E] text-white p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-[#00FF00]">
                {t("navbar.title")}
            </h1>
            <div className="flex space-x-6 text-sm font-medium">
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                Marketplace
                </a>
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                Learning Center
                </a>
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                Contact
                </a>
            </div>
            </div>
            <div className="flex items-center space-x-4">
            {account ? (
                <>
                <span className="text-sm text-gray-400">
                    {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button
                    onClick={disconnectWallet}
                    className="flex items-center bg-[#2A2A3E] px-3 py-2 rounded-lg hover:bg-[#3A3A4E] transition"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    <span>{t("navbar.disconnect")}</span>
                </button>
                </>
            ) : (
                <button
                onClick={connectWallet}
                className="flex items-center bg-[#2A2A3E] px-3 py-2 rounded-lg hover:bg-[#3A3A4E] transition"
                >
                <WalletIcon className="w-5 h-5 mr-2" />
                <span>{t("navbar.connect")}</span>
                </button>
            )}
            <div className="relative group">
                <button className="flex items-center bg-[#2A2A3E] px-3 py-2 rounded-lg hover:bg-[#3A3A4E] transition">
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                <span>{t("navbar.language")}</span>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-[#2A2A3E] rounded-lg shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-10">
                <div className="py-1">
                    <button
                    onClick={() => changeLanguage("en")}
                    className={`block w-full text-left px-4 py-2 hover:bg-[#3A3A4E] ${i18n.language === 'en' ? 'bg-[#3A3A4E]' : ''}`}
                    >
                    English
                    </button>
                    <button
                    onClick={() => changeLanguage("zh")}
                    className={`block w-full text-left px-4 py-2 hover:bg-[#3A3A4E] ${i18n.language === 'zh' ? 'bg-[#3A3A4E]' : ''}`}
                    >
                    中文
                    </button>
                </div>
                </div>
            </div>
            </div>
        </nav>
    );
};

export default Navbar;
