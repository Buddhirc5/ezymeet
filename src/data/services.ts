import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  FileBadge,
  FileCheck,
  FileSignature,
  Gem,
  Globe,
  Headset,
  Home,
  IdCard,
  Info,
  PiggyBank,
  Receipt,
  ScrollText,
  Ship,
  UserCog,
  UserRound,
  Users,
  BookOpen,
  HandCoins,
} from 'lucide-react'

export interface BranchService {
  id: string
  name: string
  desc: string
  category: string
  icon: LucideIcon
  /** Estimated service time at the counter, in minutes */
  tat: number
  docs: string[]
  popular?: boolean
}

export const SERVICE_CATEGORIES = [
  'Everyday Banking',
  'Cash & Cheques',
  'Letters & Documents',
  'Loans & Investments',
  'Business & Trade',
  'Meet Our Team',
] as const

export const BRANCH_SERVICES: BranchService[] = [
  // Everyday Banking
  { id: 'general', name: 'General Banking Inquiries', desc: 'Accounts, cards, statements', category: 'Everyday Banking', icon: Info, tat: 10, docs: ['National ID (NIC)'], popular: true },
  { id: 'account-open', name: 'Account Opening', desc: 'Savings, current & minor accounts', category: 'Everyday Banking', icon: UserRound, tat: 25, docs: ['National ID (NIC)', 'Proof of address (utility bill)'] },
  { id: 'cards', name: 'Debit & Credit Card Services', desc: 'New card, replacement, PIN reset', category: 'Everyday Banking', icon: CreditCard, tat: 15, docs: ['National ID (NIC)', 'Existing card (if any)'] },
  { id: 'kyc-update', name: 'Update Personal Details', desc: 'Address, mobile number, KYC refresh', category: 'Everyday Banking', icon: IdCard, tat: 10, docs: ['National ID (NIC)', 'Proof of new address'] },

  // Cash & Cheques
  { id: 'bulk-cash', name: 'Bulk Cash Deposit / Withdrawal', desc: 'Large cash transactions, pre-arranged', category: 'Cash & Cheques', icon: Banknote, tat: 20, docs: ['National ID (NIC)', 'Account number'], popular: true },
  { id: 'cheque-deposit', name: 'Cheque Deposit & Collection', desc: 'Deposit, realise or collect cheques', category: 'Cash & Cheques', icon: Receipt, tat: 10, docs: ['Cheque(s)', 'Account number'] },
  { id: 'cheque-book', name: 'Cheque Book Request / Collection', desc: 'Order or collect a cheque book', category: 'Cash & Cheques', icon: BookOpen, tat: 10, docs: ['National ID (NIC)', 'Request slip (if ordered)'] },
  { id: 'pay-order', name: 'Pay Order / Bank Draft', desc: 'Issue a pay order or demand draft', category: 'Cash & Cheques', icon: FileSignature, tat: 15, docs: ['National ID (NIC)', 'Payee name & amount'], popular: true },

  // Letters & Documents
  { id: 'balance-confirmation', name: 'Balance Confirmation Letter', desc: 'Request or collect for visa, audit, loans', category: 'Letters & Documents', icon: FileCheck, tat: 15, docs: ['National ID (NIC)', 'Request letter (for collection)'], popular: true },
  { id: 'statements', name: 'Statements & Certificates', desc: 'Bank statements, interest certificates', category: 'Letters & Documents', icon: ScrollText, tat: 10, docs: ['National ID (NIC)'] },
  { id: 'doc-collection', name: 'Document Collection', desc: 'Collect deeds, letters, approvals', category: 'Letters & Documents', icon: FileBadge, tat: 10, docs: ['National ID (NIC)', 'Collection reference / SMS'] },

  // Loans & Investments
  { id: 'loans', name: 'Personal & Housing Loans', desc: 'New loan discussion, documents', category: 'Loans & Investments', icon: Home, tat: 40, docs: ['National ID (NIC)', 'Last 3 salary slips', 'Bank statements (6 months)'] },
  { id: 'leasing', name: 'Leasing', desc: 'Vehicle & equipment leasing', category: 'Loans & Investments', icon: Car, tat: 30, docs: ['National ID (NIC)', 'Vehicle quotation'] },
  { id: 'pawning', name: 'Pawning Services', desc: 'Gold loans, redemption & renewal', category: 'Loans & Investments', icon: Gem, tat: 20, docs: ['National ID (NIC)', 'Gold articles / pawn ticket'] },
  { id: 'fd', name: 'Fixed Deposits', desc: 'Open, renew or uplift FDs', category: 'Loans & Investments', icon: PiggyBank, tat: 20, docs: ['National ID (NIC)', 'FD certificate (for renewal)'] },
  { id: 'fx', name: 'Foreign Currency & Remittances', desc: 'FCY accounts, inward / outward transfers', category: 'Loans & Investments', icon: Globe, tat: 20, docs: ['National ID / Passport', 'Remittance details'] },

  // Business & Trade
  { id: 'trade', name: 'Trade Finance', desc: 'LCs, guarantees, import / export bills', category: 'Business & Trade', icon: Ship, tat: 45, docs: ['Business registration', 'Trade documents'] },
  { id: 'business', name: 'Business Banking Requests', desc: 'Current accounts, facilities, payroll', category: 'Business & Trade', icon: Building2, tat: 30, docs: ['Business registration', 'Board resolution (if required)'] },
  { id: 'sme', name: 'SME Loans & Working Capital', desc: 'Overdrafts, term loans, credit lines', category: 'Business & Trade', icon: HandCoins, tat: 40, docs: ['Business registration', 'Financial statements'] },

  // Meet Our Team
  { id: 'rm', name: 'Meet Relationship Manager', desc: 'Personalised advice & reviews', category: 'Meet Our Team', icon: UserCog, tat: 30, docs: ['National ID (NIC)'] },
  { id: 'branch-manager', name: 'Meet Branch Manager', desc: 'Escalations & special requests', category: 'Meet Our Team', icon: Users, tat: 30, docs: ['National ID (NIC)'] },
]

export interface VirtualTopic {
  id: string
  name: string
  desc: string
  icon: LucideIcon
  duration: number
  needsDocs?: boolean
}

export const VIRTUAL_TOPICS: VirtualTopic[] = [
  { id: 'video-kyc', name: 'Video KYC', desc: 'Open an account without visiting a branch', icon: IdCard, duration: 15, needsDocs: true },
  { id: 'loan-advisory', name: 'Loan & Housing Advisory', desc: 'Eligibility, rates and documents', icon: Home, duration: 20 },
  { id: 'investment-advisory', name: 'FD & Investment Advisory', desc: 'Grow your savings smartly', icon: PiggyBank, duration: 20 },
  { id: 'business-advisory', name: 'Business & Trade Advisory', desc: 'Facilities, LCs and guarantees', icon: Briefcase, duration: 30 },
  { id: 'card-support', name: 'Card & Digital Banking Help', desc: 'Cards, EZY app and online banking', icon: Headset, duration: 10 },
  { id: 'rm-call', name: 'Relationship Manager Call', desc: 'Talk to your dedicated RM', icon: UserCog, duration: 20 },
]

export const KYC_DOCUMENTS = [
  { id: 'nic-front', label: 'National ID (Front)' },
  { id: 'nic-back', label: 'National ID (Back)' },
  { id: 'selfie', label: 'Selfie Photo' },
  { id: 'address', label: 'Proof of Address' },
]

export const getService = (id: string) => BRANCH_SERVICES.find((s) => s.id === id)
export const getTopic = (id: string) => VIRTUAL_TOPICS.find((t) => t.id === id)
