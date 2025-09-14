import api from './axios';
import { Category, Account, Transaction, TransactionSummary, AccountBalance } from '../types';

export const expensesAPI = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string; color?: string }): Promise<Category> => {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}/`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },

  getCategoryTransactions: async (id: number): Promise<Transaction[]> => {
    const response = await api.get(`/categories/${id}/transactions/`);
    return response.data;
  },

  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/accounts/');
    return response.data;
  },

  createAccount: async (data: {
    name: string;
    account_type: string;
    description?: string;
  }): Promise<Account> => {
    const response = await api.post('/accounts/', data);
    return response.data;
  },

  updateAccount: async (id: number, data: Partial<Account>): Promise<Account> => {
    const response = await api.put(`/accounts/${id}/`, data);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}/`);
  },

  getAccountTransactions: async (id: number): Promise<Transaction[]> => {
    const response = await api.get(`/accounts/${id}/transactions/`);
    return response.data;
  },

  getAccountBalance: async (id: number): Promise<AccountBalance> => {
    const response = await api.get(`/accounts/${id}/balance/`);
    return response.data;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/');
    return response.data;
  },

  createTransaction: async (data: {
    account: number;
    category?: number;
    transaction_type: string;
    amount: string;
    description: string;
    notes?: string;
    date: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}/`, data);
    return response.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}/`);
  },

  getTransactionSummary: async (): Promise<TransactionSummary> => {
    const response = await api.get('/transactions/summary/');
    return response.data;
  },
};
