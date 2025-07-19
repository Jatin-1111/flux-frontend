# Personal Expense Tracker

## What is This Project?

A smart, comprehensive personal expense tracking application that goes beyond basic expense logging. Built to actually help individuals manage their finances effectively with intelligent features, insights, and proper money management tools.

### Target Users
- **Individuals** wanting better control over personal finances
- **Students** tracking budgets and expenses
- **Freelancers** managing business and personal expenses
- **Anyone** tired of basic expense apps that just store data without insights

### Value Proposition
More than just "add expense, see total" - this is a complete personal financial management system:
- 💰 **Smart Expense Tracking** - Intelligent categorization and recurring detection
- 🎯 **Goal Management** - Savings goals with progress tracking
- 📊 **Advanced Analytics** - Spending insights, trends, and predictions
- 🔄 **Expense Splitting** - Share expenses with friends/family
- 💱 **Multi-Currency Support** - Travel and international expense handling
- 📈 **Income vs Expense Tracking** - Complete financial picture
- 🔔 **Smart Budgets** - Intelligent alerts and budget management

### Business Model
**Freemium Personal App:**
- **Free Tier:** Basic expense tracking (100 expenses/month)
- **Premium Tier:** $4.99/month (unlimited expenses, advanced features, insights)

---

## Frontend Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Authentication:** JWT
- **Payments:** Stripe integration (Premium subscriptions)
- **Deployment:** Vercel

---

## Project Structure

```
expense-tracker-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/           # Main expense overview
│   ├── expenses/
│   │   ├── add/            # Add new expense
│   │   ├── recurring/      # Manage recurring expenses
│   │   └── split/          # Split expenses with others
│   ├── budgets/            # Budget management
│   ├── goals/              # Savings goals
│   ├── analytics/          # Insights and trends
│   ├── income/             # Income tracking
│   ├── settings/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── forms/              # Form components
│   ├── charts/             # Data visualization
│   ├── expense/            # Expense-specific components
│   └── layout/             # Navigation, headers
├── lib/
│   ├── api.js              # API client setup
│   ├── auth.js             # Authentication utilities
│   ├── currency.js         # Currency conversion utilities
│   └── utils.js            # Helper functions
├── store/
│   ├── authStore.js        # Authentication state
│   ├── expenseStore.js     # Expense management state
│   ├── budgetStore.js      # Budget management state
│   └── goalStore.js        # Goals and savings state
└── constants/
    └── categories.js       # Default expense categories
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
NEXT_PUBLIC_CURRENCY_API_KEY=your_currency_api_key
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

## User Flow & Features

### Core User Journeys

#### Smart Expense Management Journey
1. **User** opens app → quick add expense form
2. **System** suggests category based on description/amount
3. **User** adds expense with optional tags, location, currency
4. **System** detects recurring patterns → suggests automation
5. **System** updates budgets and provides instant feedback

#### Budget & Goal Management Journey
1. **User** sets monthly budgets per category
2. **System** tracks spending in real-time
3. **User** receives smart alerts at 75%, 90%, 100% of budget
4. **System** suggests budget adjustments based on patterns
5. **User** sets savings goals with automated progress tracking

#### Expense Splitting Journey
1. **User** adds shared expense (dinner, trip, etc.)
2. **System** calculates splits (equal, custom, percentage)
3. **User** sends split requests via email/link
4. **Friends** mark their portion as paid
5. **System** tracks who owes what

#### Financial Analytics Journey
1. **User** accesses insights dashboard
2. **System** shows spending trends, budget health
3. **User** gets personalized recommendations
4. **System** predicts future spending patterns
5. **User** exports data for taxes or analysis

### Advanced Features

#### Recurring Expense Intelligence
- **Auto-Detection:** "You've paid Netflix $15.99 for 3 months - make it recurring?"
- **Smart Scheduling:** Automatically creates future expenses
- **Flexible Rules:** Weekly, monthly, yearly with end dates

#### Multi-Currency Support
- **Real-time Exchange Rates:** Auto-fetch current rates
- **Travel Mode:** Easily switch primary currency
- **Conversion History:** Track exchange rate changes

#### Goal & Savings Tracking
- **Visual Progress:** Charts showing goal completion
- **Auto-Save Rules:** "Save $200 every payday toward emergency fund"
- **Milestone Celebrations:** Gamification elements

#### Smart Analytics & Insights
- **Spending Trends:** "Food spending up 40% vs last month"
- **Budget Predictions:** "On track to exceed budget by $150"
- **Recommendations:** "Consider meal prep - restaurant visits increased 60%"
- **Monthly Reports:** Automated financial health summaries

---

## Component Architecture

### Reusable Components
- **UI Components:** Buttons, forms, modals, tables
- **Chart Components:** Revenue charts, expense trends
- **Form Components:** Expense forms, invoice builders
- **Layout Components:** Navigation, sidebars, headers

### State Management Pattern
```javascript
// Example: Expense Store
const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  filters: { category: 'all', dateRange: 'thisMonth' },
  
  fetchExpenses: async (filters) => {
    set({ loading: true })
    const expenses = await api.get('/expenses', { params: filters })
    set({ expenses, loading: false })
  },
  
  addExpense: async (expenseData) => {
    const newExpense = await api.post('/expenses', expenseData)
    set(state => ({ 
      expenses: [newExpense, ...state.expenses] 
    }))
  },
  
  detectRecurring: (expense) => {
    const similar = get().expenses.filter(e => 
      e.description.toLowerCase() === expense.description.toLowerCase() &&
      Math.abs(e.amount - expense.amount) < 1
    )
    return similar.length >= 2
  }
}))
```

---

## API Integration

### Base API Setup
```javascript
// lib/api.js
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

// Handle currency conversion
api.interceptors.response.use(response => {
  if (response.data.expenses) {
    response.data.expenses = response.data.expenses.map(expense => ({
      ...expense,
      displayAmount: convertCurrency(expense.amount, expense.currency, userCurrency)
    }))
  }
  return response
})
```

### Key API Endpoints
- `POST /auth/login` - User authentication
- `GET /expenses` - Fetch expenses with filters
- `POST /expenses` - Create expense
- `POST /expenses/recurring` - Create recurring expense
- `POST /expenses/split` - Split expense with others
- `GET /budgets` - Get budget status
- `POST /goals` - Create savings goal
- `GET /analytics/insights` - Get spending insights
- `GET /income` - Track income sources

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
NEXT_PUBLIC_API_URL=https://api.expensetracker.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
NEXT_PUBLIC_CURRENCY_API_KEY=your_production_currency_key
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

### Phase 1 (MVP - 2 Weeks)
- ✅ User authentication
- ✅ Basic expense CRUD
- ✅ Categories and budgets
- ✅ Simple dashboard

### Phase 2 (Enhanced Features - 2 Weeks)
- 🔄 Recurring expense detection
- 💱 Multi-currency support
- 🎯 Savings goals
- 📊 Basic analytics

### Phase 3 (Advanced Features - 3 Weeks)
- 🤝 Expense splitting
- 💰 Income tracking
- 📈 Advanced insights
- 📱 Mobile PWA

### Phase 4 (Premium Features)
- 🔗 Bank integrations
- 📄 Advanced export options
- 🤖 AI spending insights
- 🌍 Investment tracking