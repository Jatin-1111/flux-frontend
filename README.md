# Flux - Business Financial Operations Platform

## What is Flux?

Flux is a comprehensive B2B financial management platform designed to streamline business financial operations. We eliminate the need for multiple tools by providing expense management, invoice generation, client management, and financial reporting in one integrated platform.

### Target Market
- **Small to Medium Businesses (5-500 employees)**
- **Agencies, consultancies, startups**
- **Companies tired of juggling Excel, paper receipts, and separate billing tools**

### Value Proposition
Instead of using 5+ different tools for financial operations, businesses get everything in one platform:
- ✅ **Expense Management** - Digital receipt processing with AI OCR
- ✅ **Invoice Generation** - Professional invoicing with client portal
- ✅ **Financial Reporting** - Real-time insights and analytics
- ✅ **Team Management** - Role-based access and approval workflows
- ✅ **Client Management** - Centralized client database and payment tracking

### Business Model
**Two-Tier B2B SaaS:**
- **Business Tier:** $25-50/user/month (SMBs, startups, agencies)
- **Enterprise Tier:** $75+/user/month (larger companies, advanced features)

---

## Frontend Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Authentication:** JWT with role-based access
- **Payments:** Stripe integration
- **Deployment:** Vercel

---

## Project Structure

```
flux-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── expenses/
│   │   ├── invoices/
│   │   ├── clients/
│   │   ├── reports/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── charts/          # Data visualization
│   └── layout/          # Navigation, headers
├── lib/
│   ├── api.ts           # API client setup
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
├── store/
│   ├── authStore.ts     # Authentication state
│   ├── expenseStore.ts  # Expense management state
│   └── invoiceStore.ts  # Invoice management state
└── types/
    └── index.ts         # TypeScript definitions
```

---

## Development Workflow

### 1. Setup & Installation
```bash
# Clone repository
git clone <repo-url>
cd flux-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 2. Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 3. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## User Flow & Features

### Authentication Flow
1. **Company Signup** → Admin creates company account
2. **Team Invitation** → Admin invites team members
3. **Role Assignment** → Users get appropriate permissions
4. **Dashboard Access** → Role-based feature access

### Core User Journeys

#### Expense Management Journey
1. **Employee** uploads receipt photo
2. **AI OCR** extracts amount, date, vendor
3. **Employee** adds category and description
4. **Manager** receives notification for approval
5. **Manager** approves/rejects with comments
6. **Admin** processes reimbursement

#### Invoice Generation Journey
1. **Admin/Manager** creates new invoice
2. **System** pulls client information
3. **User** adds line items, applies taxes/discounts
4. **System** generates professional PDF
5. **Client** receives email with payment link
6. **System** tracks payment status

#### Financial Reporting Journey
1. **Admin** accesses reports dashboard
2. **System** displays real-time metrics
3. **User** filters by date, category, department
4. **System** generates exportable reports
5. **User** shares insights with stakeholders

### User Roles & Permissions

#### Admin
- Full platform access
- User management
- Billing & subscription management
- Advanced reporting
- Company settings

#### Manager
- Approve/reject expenses
- Create invoices
- View team reports
- Client management

#### Employee
- Submit expenses
- View personal reports
- Access client portal (if applicable)

---

## Component Architecture

### Reusable Components
- **UI Components:** Buttons, forms, modals, tables
- **Chart Components:** Revenue charts, expense trends
- **Form Components:** Expense forms, invoice builders
- **Layout Components:** Navigation, sidebars, headers

### State Management Pattern
```typescript
// Example: Expense Store
const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  
  fetchExpenses: async () => {
    set({ loading: true })
    const expenses = await api.get('/expenses')
    set({ expenses, loading: false })
  },
  
  submitExpense: async (expenseData) => {
    const newExpense = await api.post('/expenses', expenseData)
    set(state => ({ 
      expenses: [...state.expenses, newExpense] 
    }))
  }
}))
```

---

## API Integration

### Base API Setup
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Key API Endpoints
- `POST /auth/login` - User authentication
- `GET /expenses` - Fetch expenses
- `POST /expenses` - Create expense
- `GET /invoices` - Fetch invoices
- `POST /invoices` - Create invoice
- `GET /reports/dashboard` - Dashboard metrics

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.flux.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
```

---

## Contributing

1. Create feature branch from `main`
2. Follow TypeScript best practices
3. Use Tailwind for styling
4. Test on mobile and desktop
5. Submit PR with clear description

---

## Roadmap

### Phase 1 (MVP)
- ✅ Authentication & tenant management
- ✅ Basic expense management
- ✅ Invoice generation
- ✅ Simple reporting

### Phase 2 (Business Growth)
- 📱 Mobile app
- 🔗 Third-party integrations (QuickBooks, Xero)
- 📊 Advanced analytics
- 🤖 Enhanced AI features

### Phase 3 (Enterprise)
- 👥 HR & Payroll modules
- 📈 Advanced financial statements
- 🔐 Enterprise security features
- 🌍 Multi-currency support