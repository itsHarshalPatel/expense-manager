import type {
  Category,
  PaymentMethod,
  PaymentType,
  GroupCategory,
} from "@/constants/data";

export type { Category, PaymentMethod, PaymentType, GroupCategory };

export interface TransactionWithDetails {
  id: string;
  title: string;
  description: string;
  category: Category;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  amount: number;
  remark: string;
  paymentDate: Date;
  createdAt: Date;
  userId: string;
  groupId?: string | null;
  group?: { id: string; name: string } | null;
  contributors: ContributorWithFriend[];
}

export interface ContributorWithFriend {
  id: string;
  amount: number;
  friend: {
    id: string;
    name: string;
    prefix?: string | null;
  };
}

export interface FriendWithBalance {
  id: string;
  name: string;
  prefix?: string | null;
  phone?: string | null;
  location?: string | null;
  group?: string | null;
  isFavourite: boolean;
  balance: number;
  transactionCount: number;
}

export interface GroupWithStats {
  id: string;
  name: string;
  description?: string | null;
  category: GroupCategory;
  createdAt: Date;
  totalAmount: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
