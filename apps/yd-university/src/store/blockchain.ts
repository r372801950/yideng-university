// src/store/blockchain.ts
import { atom } from 'jotai';
import { ethers } from 'ethers';
import YiDengTokenABI from '@/abis/YiDengToken.json';
import CourseMarketABI from '@/abis/CourseMarket.json';
import { Course } from '@/types';

// 合约地址 - 从环境变量中读取
export const yiDengTokenAddressAtom = atom(
  process.env.NEXT_PUBLIC_YI_DENG_TOKEN_ADDRESS || ''
);
export const courseMarketAddressAtom = atom(
  process.env.NEXT_PUBLIC_COURSE_MARKET_ADDRESS || ''
);

// 代币相关
export const tokenNameAtom = atom<string>('');
export const tokenSymbolAtom = atom<string>('');
export const tokensPerEthAtom = atom<number>(1000); // 默认值，但会从合约读取
export const remainingSupplyAtom = atom<string>('0');
export const userBalanceAtom = atom<string>('0');

// 课程相关
export const coursesAtom = atom<Course[]>([]);
export const coursesLoadingAtom = atom<boolean>(false);
export const coursesErrorAtom = atom<string>('');

// 衍生原子: 用户余额（由其他原子导出）
export const formattedUserBalanceAtom = atom(
  (get) => {
    const balance = get(userBalanceAtom);
    const symbol = get(tokenSymbolAtom);
    return `${balance} ${symbol}`;
  }
);

// 操作原子: 获取代币信息
export const fetchTokenInfoAtom = atom(
  null,
  async (get, set, userAddress: string) => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenAddress = get(yiDengTokenAddressAtom);
      const contract = new ethers.Contract(tokenAddress, YiDengTokenABI.abi, provider);

      // 获取代币基本信息
      const name = await contract.name();
      const symbol = await contract.symbol();
      const tokensPerEth = await contract.TOKENS_PER_ETH();
      const remaining = await contract.remainingMintableSupply();
      const balance = await contract.balanceOf(userAddress);

      set(tokenNameAtom, name);
      set(tokenSymbolAtom, symbol);
      set(tokensPerEthAtom, tokensPerEth.toNumber());  // 从合约读取兑换比例
      set(remainingSupplyAtom, remaining.toString());
      set(userBalanceAtom, balance.toString());

      return { name, symbol, tokensPerEth, remaining, balance };
    } catch (err) {
      console.error('获取代币信息错误:', err);
      return null;
    }
  }
);

// 操作原子: 获取课程列表
export const fetchCoursesAtom = atom(
  null,
  async (get, set, userAddress?: string) => {
    set(coursesLoadingAtom, true);
    set(coursesErrorAtom, '');

    try {
      if (!window.ethereum) {
        throw new Error('请安装MetaMask或其他以太坊钱包');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const marketAddress = get(courseMarketAddressAtom);
      const marketContract = new ethers.Contract(marketAddress, CourseMarketABI.abi, provider);

      // 获取课程总数
      const courseCount = await marketContract.courseCount();

      // 获取所有课程信息
      const coursesList: Course[] = [];

      for (let i = 1; i <= courseCount.toNumber(); i++) {
        const courseData = await marketContract.courses(i);

        // 检查用户是否拥有这个课程
        let isOwned = false;
        if (userAddress) {
          isOwned = await marketContract.hasCourse(userAddress, courseData.web2CourseId);
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

      set(coursesAtom, coursesList);
      return coursesList;
    } catch (err: any) {
      console.error('获取课程列表错误:', err);
      set(coursesErrorAtom, err.message || String(err));
      return [];
    } finally {
      set(coursesLoadingAtom, false);
    }
  }
);