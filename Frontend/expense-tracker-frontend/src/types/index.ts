// API Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  transaction_count: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  name: string;
  account_type: string;
  account_type_display: string;
  balance: string;
  description: string;
  is_active: boolean;
  transaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  account: number;
  account_name: string;
  category: number | null;
  category_name: string;
  category_color: string;
  transaction_type: string;
  transaction_type_display: string;
  amount: string;
  description: string;
  notes: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
  income_count: number;
  expense_count: number;
}

export interface AccountBalance {
  account_name: string;
  current_balance: number;
  total_income: number;
  total_expenses: number;
  transaction_count: number;
}
