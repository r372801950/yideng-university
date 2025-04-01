// src/types/course.ts
export interface Course {
  id: number;
  web2CourseId: string;
  name: string;
  price: string;
  isActive: boolean;
  creator: string;
  owned: boolean;
}

export interface CourseCardProps {
  course: Course;
  index: number;
  isLoading: boolean;
  isApproving: boolean;
  onPurchase: (course: Course) => void;
}

export interface CoursePurchaseProps {
  yiDengTokenAddress: string;
  courseMarketAddress: string;
}