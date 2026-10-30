export type Mode = 'branch' | 'video'

export interface Service {
  id: string
  name: string
  desc: string
  category: string
  /** Estimated service / call time in minutes */
  tat: number
  docs: string[]
  /** Where this can be handled: at a branch, over a video call, or both */
  modes: Mode[]
  /** Video calls that verify identity and accept document uploads */
  needsDocs?: boolean
}

export const SERVICE_CATEGORIES = [
  'Cash & Cheques',
  'Foreign Currency & Remittances',
  'Pay Orders & Letters',
  'Accounts',
  'Cards & Digital Banking',
  'Loans & Credit',
  'Investments',
  'Business & Trade',
  'Meet Our Team',
] as const

const NIC = 'National ID (NIC)'
const B: Mode[] = ['branch']
const V: Mode[] = ['video']
const BV: Mode[] = ['branch', 'video']

export const SERVICES: Service[] = [
  // Cash & Cheques — needs cash or original instruments, so branch only
  { id: 'bulk-cash', name: 'Cash Deposit & Withdrawal', desc: 'Large cash transactions', category: 'Cash & Cheques', tat: 20, modes: B, docs: [NIC, 'Account number'] },
  { id: 'cheque-encash', name: 'Cheque Encashment', desc: 'Cash a cheque over the counter', category: 'Cash & Cheques', tat: 10, modes: B, docs: [NIC, 'Cheque'] },
  { id: 'cheque-purchase', name: 'Cheque Purchase', desc: 'Get funds before a cheque clears', category: 'Cash & Cheques', tat: 15, modes: B, docs: [NIC, 'Cheque'] },
  { id: 'outward-cheques', name: 'Outward & Transfer Cheques', desc: 'Deposit or transfer cheques', category: 'Cash & Cheques', tat: 10, modes: B, docs: ['Cheque(s)', 'Account number'] },

  // Foreign currency & remittances
  { id: 'fcy-deposit', name: 'Foreign Currency Deposit', desc: 'Deposit notes to an FCY account', category: 'Foreign Currency & Remittances', tat: 15, modes: B, docs: [NIC, 'Passport (if applicable)', 'Currency notes'] },
  { id: 'fcy-issue', name: 'Buy Foreign Currency', desc: 'Currency notes for travel or study', category: 'Foreign Currency & Remittances', tat: 15, modes: B, docs: ['Passport', 'Air ticket / visa'] },
  { id: 'fdraft-issue', name: 'Foreign Draft Issuance', desc: 'Issue a draft payable abroad', category: 'Foreign Currency & Remittances', tat: 20, modes: B, docs: [NIC, 'Payee details', 'Supporting invoice / letter'] },
  { id: 'fdraft-collect', name: 'Foreign Draft Collection', desc: 'Deposit a draft received from abroad', category: 'Foreign Currency & Remittances', tat: 15, modes: B, docs: [NIC, 'Original draft'] },
  { id: 'tt', name: 'Telegraphic Transfer (TT)', desc: 'Send money abroad by TT', category: 'Foreign Currency & Remittances', tat: 25, modes: B, docs: [NIC, 'Beneficiary bank details', 'Purpose documents'] },
  { id: 'fcy-transfer', name: 'Foreign Currency Fund Transfer', desc: 'Transfers between FCY accounts', category: 'Foreign Currency & Remittances', tat: 20, modes: B, docs: [NIC, 'Beneficiary details'] },
  { id: 'rtgs', name: 'RTGS Transfer', desc: 'High-value same-day transfers', category: 'Foreign Currency & Remittances', tat: 15, modes: B, docs: [NIC, 'Beneficiary bank & account'] },

  // Pay orders & letters
  { id: 'pay-order', name: 'Pay Order Issuance', desc: 'Issue a pay order', category: 'Pay Orders & Letters', tat: 15, modes: B, docs: [NIC, 'Payee name & amount'] },
  { id: 'pay-order-cancel', name: 'Pay Order Cancellation', desc: 'Cancel and refund a pay order', category: 'Pay Orders & Letters', tat: 15, modes: B, docs: [NIC, 'Original pay order'] },
  { id: 'gift-voucher', name: 'Gift Vouchers', desc: 'Buy Pan Asia gift vouchers', category: 'Pay Orders & Letters', tat: 10, modes: B, docs: [NIC] },
  { id: 'balance-confirmation', name: 'Balance Confirmation Letter', desc: 'For visa, audit or loan purposes', category: 'Pay Orders & Letters', tat: 15, modes: B, docs: [NIC, 'Request letter'] },
  { id: 'certified-statement', name: 'Certified Bank Statement', desc: 'Signed & stamped statement', category: 'Pay Orders & Letters', tat: 15, modes: B, docs: [NIC] },

  // Accounts — everyday savings / FD opening is done in the app
  { id: 'current-account', name: 'Current Account Opening', desc: 'Personal or business current account', category: 'Accounts', tat: 30, modes: B, docs: [NIC, 'Proof of address', 'Business registration (business)'] },
  { id: 'minor-account', name: 'Minor Savings Account', desc: 'Open an account for your child', category: 'Accounts', tat: 20, modes: B, docs: ["Child's birth certificate", "Guardian's NIC"] },
  { id: 'fcy-account', name: 'Foreign Currency Account', desc: 'PFCA, IIA or NRRA accounts', category: 'Accounts', tat: 25, modes: BV, needsDocs: true, docs: ['Passport', NIC, 'Proof of foreign income / residence'] },
  { id: 'personal-details', name: 'Update Personal Details', desc: 'Address, mobile number, name change', category: 'Accounts', tat: 10, modes: BV, needsDocs: true, docs: [NIC, 'Proof of new details'] },
  { id: 'dormant-release', name: 'Dormant Account Release', desc: 'Reactivate an inactive account', category: 'Accounts', tat: 15, modes: BV, needsDocs: true, docs: [NIC] },
  { id: 'signature-change', name: 'Signature Change', desc: 'Update your specimen signature', category: 'Accounts', tat: 15, modes: B, docs: [NIC] },
  { id: 'nominations', name: 'Nominations', desc: 'Add or change account nominees', category: 'Accounts', tat: 15, modes: B, docs: [NIC, "Nominee's NIC / birth certificate"] },
  { id: 'freeze-lien', name: 'Account Freeze & Lien', desc: 'Place or release a freeze or lien', category: 'Accounts', tat: 20, modes: B, docs: [NIC, 'Request letter'] },
  { id: 'account-closure', name: 'Account Closure', desc: 'Close an account', category: 'Accounts', tat: 15, modes: B, docs: [NIC, 'Unused cheques & cards'] },
  { id: 'locker', name: 'Safe Deposit Locker', desc: 'Rent, access or surrender a locker', category: 'Accounts', tat: 20, modes: B, docs: [NIC, 'Locker key (for access)'] },

  // Cards & digital banking
  { id: 'debit-card', name: 'Debit Card Issuance', desc: 'New or replacement card & PIN', category: 'Cards & Digital Banking', tat: 15, modes: B, docs: [NIC] },
  { id: 'credit-card', name: 'Credit Card Services', desc: 'Applications, limits, disputes', category: 'Cards & Digital Banking', tat: 15, modes: BV, docs: [NIC, 'Salary slip (for applications)'] },
  { id: 'ezy-activation', name: 'EZY App & Online Banking Activation', desc: 'Activate or reset digital access', category: 'Cards & Digital Banking', tat: 10, modes: BV, needsDocs: true, docs: [NIC] },
  { id: 'fund-recall', name: 'Fund Recall & Bill Payment Reversal', desc: 'Wrong transfer or bill payment', category: 'Cards & Digital Banking', tat: 15, modes: BV, docs: [NIC, 'Transaction reference'] },

  // Loans & credit
  { id: 'loans', name: 'Personal & Housing Loans', desc: 'Eligibility, rates and documents', category: 'Loans & Credit', tat: 40, modes: BV, docs: [NIC, 'Last 3 salary slips', 'Bank statements (6 months)'] },
  { id: 'leasing', name: 'Leasing', desc: 'Vehicle & equipment leasing', category: 'Loans & Credit', tat: 30, modes: BV, docs: [NIC, 'Vehicle quotation'] },
  { id: 'pawning', name: 'Pawning', desc: 'Gold loans, redemption & renewal', category: 'Loans & Credit', tat: 20, modes: B, docs: [NIC, 'Gold articles / pawn ticket'] },
  { id: 'od-cash', name: 'Overdraft Against Deposits', desc: 'OD secured by cash or FD', category: 'Loans & Credit', tat: 25, modes: B, docs: [NIC, 'FD certificate'] },
  { id: 'cash-margin', name: 'Cash Margin Facility', desc: 'Margin-backed credit facility', category: 'Loans & Credit', tat: 25, modes: B, docs: [NIC, 'Facility documents'] },
  { id: 'credit-docs', name: 'Collect Credit Documents', desc: 'Offer letters, deeds, approvals', category: 'Loans & Credit', tat: 10, modes: B, docs: [NIC, 'Collection reference / SMS'] },

  // Investments
  { id: 'tbills', name: 'Treasury Bills, Bonds & REPO', desc: 'Government securities investments', category: 'Investments', tat: 20, modes: BV, docs: [NIC] },

  // Business & trade
  { id: 'trade', name: 'Trade Finance', desc: 'LCs, guarantees, import / export bills', category: 'Business & Trade', tat: 45, modes: BV, docs: ['Business registration', 'Trade documents'] },
  { id: 'business', name: 'Business Banking & SME Loans', desc: 'Facilities, payroll, working capital', category: 'Business & Trade', tat: 40, modes: BV, docs: ['Business registration', 'Financial statements'] },

  // Meet our team
  { id: 'rm', name: 'Relationship Manager', desc: 'Personalised advice & reviews', category: 'Meet Our Team', tat: 30, modes: BV, docs: [NIC] },
  { id: 'branch-manager', name: 'Branch Manager', desc: 'Escalations & special requests', category: 'Meet Our Team', tat: 30, modes: B, docs: [NIC] },

  // Video only
  { id: 'video-kyc', name: 'Video KYC', desc: 'Become a customer without visiting a branch', category: 'Accounts', tat: 15, modes: V, needsDocs: true, docs: [NIC, 'Proof of address'] },
]

/** Already self-service in the EZY app (Menu → Service Requests), so no appointment is offered. */
export const IN_APP = [
  { name: 'Savings Account Opening', where: 'Service Requests → Account Services' },
  { name: 'Fixed Deposit Opening & Upliftment', where: 'Service Requests → Account Services' },
  { name: 'Investment Planner', where: 'Service Requests → Account Services' },
  { name: 'Cashback Loan', where: 'Service Requests → Account Services' },
  { name: 'Cheque Book Request', where: 'Service Requests → Account Services' },
  { name: 'Stop Cheque Payment', where: 'Service Requests → Account Services' },
  { name: 'Fund Transfers (LKR)', where: 'Home → Transfer Funds' },
  { name: 'Standing Orders', where: 'Menu → Scheduled Transactions' },
  { name: 'Bank Statements', where: 'Accounts → e-Statement' },
]

export const KYC_DOCUMENTS = [
  { id: 'nic-front', label: 'National ID (Front)' },
  { id: 'nic-back', label: 'National ID (Back)' },
  { id: 'selfie', label: 'Selfie Photo' },
  { id: 'address', label: 'Proof of Address' },
]

export const getService = (id: string) => SERVICES.find((s) => s.id === id)
export const servicesFor = (mode: Mode) => SERVICES.filter((s) => s.modes.includes(mode))
