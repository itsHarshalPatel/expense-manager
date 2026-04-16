export const CATEGORIES = [
  { value: "Food", icon: "🍔", image: "/icons/FoodIcon.svg" },
  { value: "Gaming", icon: "🎮", image: "/icons/GamingIcon.svg" },
  { value: "Groceries", icon: "🛒", image: "/icons/GrocriesIcon.svg" },
  { value: "Home", icon: "🏠", image: "/icons/HomeIcon.svg" },
  { value: "Medical", icon: "💊", image: "/icons/MedicalIcon.svg" },
  { value: "Movie", icon: "🎬", image: "/icons/MovieIcon.svg" },
  { value: "Shopping", icon: "🛍️", image: "/icons/shoppingIcon.svg" },
  { value: "Technology", icon: "💻", image: "/icons/TechnologyIcon.svg" },
  { value: "Miscellaneous", icon: "🗑️", image: "/icons/TechnologyIcon.svg" },
] as const;

export const PAYMENT_METHODS = [
  { value: "Credit", icon: "📈" },
  { value: "Debit", icon: "📉" },
] as const;

export const PAYMENT_TYPES = [
  { value: "Online Bank Transfer", icon: "🌐" },
  { value: "Card", icon: "💳" },
  { value: "Cash", icon: "💵" },
] as const;

export const GROUP_CATEGORIES = [
  { value: "Entertainment", icon: "📺", color: "#7C3AED" },
  { value: "Education", icon: "📚", color: "#2563EB" },
  { value: "Food", icon: "🍽️", color: "#D97706" },
  { value: "Gaming", icon: "🎮", color: "#059669" },
  { value: "Household", icon: "🧹", color: "#6B7280" },
  { value: "Party", icon: "🎉", color: "#DB2777" },
  { value: "Transport", icon: "🚗", color: "#0891B2" },
  { value: "Trip", icon: "🏖️", color: "#D97706" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];
export type PaymentType = (typeof PAYMENT_TYPES)[number]["value"];
export type GroupCategory = (typeof GROUP_CATEGORIES)[number]["value"];

export function getCategoryMeta(value: string) {
  return (
    CATEGORIES.find((c) => c.value === value) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}

export function getGroupCategoryColor(value: string) {
  return GROUP_CATEGORIES.find((g) => g.value === value)?.color ?? "#6B7280";
}
