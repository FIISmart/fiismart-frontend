export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface CourseCard {
  id: number;
  category: string;
  title: string;
  instructor: string;
  duration: string;
  students: string;
  rating: number;
  tag?: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface AboutFeature {
  title: string;
  description: string;
}
