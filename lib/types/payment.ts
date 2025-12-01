/**
 * Payment System Types
 * Type definitions for the payment integration feature
 */

import type { Database } from '@/lib/supabase/databaseTypes'

// Base types from database
export type PaymentMethod = Database['public']['Tables']['PaymentMethod']['Row']
export type PaymentMethodInsert = Database['public']['Tables']['PaymentMethod']['Insert']
export type PaymentMethodUpdate = Database['public']['Tables']['PaymentMethod']['Update']

export type ListingPaymentOption = Database['public']['Tables']['ListingPaymentOption']['Row']
export type ListingPaymentOptionInsert = Database['public']['Tables']['ListingPaymentOption']['Insert']

export type PaymentTransaction = Database['public']['Tables']['PaymentTransaction']['Row']
export type PaymentTransactionInsert = Database['public']['Tables']['PaymentTransaction']['Insert']
export type PaymentTransactionUpdate = Database['public']['Tables']['PaymentTransaction']['Update']

export type PaymentTransactionHistory = Database['public']['Tables']['PaymentTransactionHistory']['Row']

// Enums
export type PaymentMethodType = Database['public']['Enums']['PaymentMethodType']
export type TransactionStatus = Database['public']['Enums']['TransactionStatus']

// View types
export type ActivePaymentTransactionView = Database['public']['Views']['ActivePaymentTransactionsView']['Row']

// Extended types with relations
export type PaymentMethodWithUser = PaymentMethod & {
  user?: {
    id: number
    name: string | null
    avatarUrl: string | null
  }
}

export type PaymentTransactionWithDetails = PaymentTransaction & {
  listing?: {
    id: number
    title: string
    priceCents: number
    imageUrl: string | null
    images: string[]
  }
  buyer?: {
    id: number
    name: string | null
    avatarUrl: string | null
  }
  seller?: {
    id: number
    name: string | null
    avatarUrl: string | null
  }
}

export type ListingWithPaymentOptions = {
  id: number
  title: string
  priceCents: number
  paymentOptions: PaymentMethodType[]
  sellerPaymentMethods?: PaymentMethod[]
}

// Form/API types
export interface CreatePaymentMethodInput {
  methodType: PaymentMethodType
  paymentHandle?: string | null
  displayName?: string | null
  notes?: string | null
  isPreferred?: boolean
}

export interface UpdatePaymentMethodInput {
  paymentHandle?: string | null
  displayName?: string | null
  notes?: string | null
  isActive?: boolean
  isPreferred?: boolean
}

export interface InitiateTransactionInput {
  listingId: number
  sellerId: number
  paymentMethodType: PaymentMethodType
  amount: number
  buyerNotes?: string
  meetingLocation?: string
  meetingTime?: string
}

export interface UpdateTransactionStatusInput {
  status: TransactionStatus
  notes?: string
  disputeReason?: string
}

// UI Display types
export interface PaymentMethodDisplay {
  type: PaymentMethodType
  icon: string
  label: string
  color: string
  description: string
  handlePlaceholder: string
  handlePrefix?: string
}

export const PAYMENT_METHOD_INFO: Record<PaymentMethodType, PaymentMethodDisplay> = {
  venmo: {
    type: 'venmo',
    icon: '💸',
    label: 'Venmo',
    color: 'bg-blue-500',
    description: 'Quick digital payment',
    handlePlaceholder: 'username',
    handlePrefix: '@',
  },
  cashapp: {
    type: 'cashapp',
    icon: '💵',
    label: 'Cash App',
    color: 'bg-green-500',
    description: 'Instant money transfer',
    handlePlaceholder: 'cashtag',
    handlePrefix: '$',
  },
  zelle: {
    type: 'zelle',
    icon: '🏦',
    label: 'Zelle',
    color: 'bg-purple-500',
    description: 'Bank-to-bank transfer',
    handlePlaceholder: 'email or phone',
  },
  cash: {
    type: 'cash',
    icon: '💰',
    label: 'Cash',
    color: 'bg-yellow-500',
    description: 'In-person cash payment',
    handlePlaceholder: 'N/A',
  },
}

// Transaction status display
export interface TransactionStatusDisplay {
  status: TransactionStatus
  label: string
  color: string
  icon: string
  description: string
}

export const TRANSACTION_STATUS_INFO: Record<TransactionStatus, TransactionStatusDisplay> = {
  pending_payment: {
    status: 'pending_payment',
    label: 'Pending Payment',
    color: 'bg-yellow-500',
    icon: '⏳',
    description: 'Waiting for buyer to send payment',
  },
  payment_sent: {
    status: 'payment_sent',
    label: 'Payment Sent',
    color: 'bg-blue-500',
    icon: '📤',
    description: 'Buyer claims payment sent, awaiting seller confirmation',
  },
  payment_confirmed: {
    status: 'payment_confirmed',
    label: 'Payment Confirmed',
    color: 'bg-green-500',
    icon: '✅',
    description: 'Seller confirmed payment received',
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    color: 'bg-emerald-500',
    icon: '🎉',
    description: 'Transaction successfully completed',
  },
  disputed: {
    status: 'disputed',
    label: 'Disputed',
    color: 'bg-red-500',
    icon: '⚠️',
    description: 'Transaction under dispute',
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    color: 'bg-gray-500',
    icon: '❌',
    description: 'Transaction cancelled',
  },
}

// Helper functions
export function formatPaymentHandle(method: PaymentMethod): string {
  if (!method.paymentHandle) {
    return 'N/A'
  }
  
  const prefix = PAYMENT_METHOD_INFO[method.methodType].handlePrefix
  if (prefix && !method.paymentHandle.startsWith(prefix)) {
    return `${prefix}${method.paymentHandle}`
  }
  
  return method.paymentHandle
}

export function getPaymentMethodIcon(type: PaymentMethodType): string {
  return PAYMENT_METHOD_INFO[type]?.icon || '💳'
}

export function getTransactionStatusColor(status: TransactionStatus): string {
  return TRANSACTION_STATUS_INFO[status]?.color || 'bg-gray-500'
}

export function canBuyerConfirmPayment(transaction: PaymentTransaction): boolean {
  return transaction.status === 'pending_payment'
}

export function canSellerConfirmReceipt(transaction: PaymentTransaction): boolean {
  return transaction.status === 'payment_sent'
}

export function canRaiseDispute(transaction: PaymentTransaction): boolean {
  return ['pending_payment', 'payment_sent', 'payment_confirmed'].includes(transaction.status)
}

export function canCancelTransaction(transaction: PaymentTransaction): boolean {
  return ['pending_payment', 'payment_sent'].includes(transaction.status)
}
