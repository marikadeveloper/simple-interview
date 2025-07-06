# Testing TODO - Prioritized List

## Current Status

- **Overall Coverage**: 17.55% statements, 74.48% branches, 48.35% functions
- **Well Tested**: Hooks (100%), ProtectedRoute (100%), QuestionCard (99%), Utility functions (100%), Breadcrumb (100%), QuestionList (100%), Auth pages (LoginPage 98%, ChangePasswordPage 100%, ForgotPasswordPage 100%), ProfilePage (100%)
- **Needs Testing**: Most page components (0%), many business logic components, context providers, and integration flows

## Priority 1: Critical Business Logic & Utilities (High Impact, Low Effort)

### 1.1 Utility Functions (100% coverage)

- [x] **`src/utils/formatters.ts`** - `pathnameToBreadcrumbLabel` function
  - Test path conversion logic (dash to space, capitalization) **(done)**
  - Test edge cases (empty string, single word, multiple dashes) **(done)**
- [x] **`src/utils/dates.ts`** - Date formatting functions
  - Test `formatDate`, `formatDateTime`, `formatDateRelative` **(done)**
  - Test with various date formats and edge cases **(done)**
- [x] **`src/utils/betterUpdateQuery.ts`** - GraphQL cache utility
  - Test cache update logic **(done)**
  - Test with null/undefined data scenarios **(done)**
- [x] **`src/utils/debounce.ts`** - Debounce utility
  - Test debounce functionality **(done)**
- [x] **`src/lib/utils.ts`** - Utility functions
  - Test utility functions **(done)**

### 1.2 Core Components (Improved coverage)

- [x] **`src/components/Breadcrumb.tsx`** (100% coverage)
  - Test breadcrumb generation from pathname **(done)**
  - Test navigation links and current page display **(done)**
  - Test with various URL patterns **(done)**
- [x] **`src/components/QuestionList.tsx`** (100% coverage)
  - Test rendering of question cards **(done)**
  - Test empty questions array **(done)**
  - Test with single/multiple questions **(done)**
- [x] **`src/components/QuestionCard.tsx`** (99% coverage)
  - Test form validation and submission **(done)**
  - Test create and edit modes **(done)**
  - Test error handling **(done)**

## Priority 2: Authentication & User Management (High Business Value)

### 2.1 Auth Pages (Improved coverage)

- [x] **`src/pages/auth/LoginPage.tsx`** (98% coverage)
  - Test form validation and submission **(done)**
  - Test error handling and display **(done)**
  - Test navigation after successful login **(done)**
  - Test loading states **(done)**
- [x] **`src/pages/auth/ChangePasswordPage.tsx`** (100% coverage)
  - Test password change flow **(done)**
  - Test validation and error handling **(done)**
- [x] **`src/pages/auth/ForgotPasswordPage.tsx`** (100% coverage)
  - Test password reset request flow **(done)**
  - Test validation and error handling **(done)**

### 2.2 User Management

- [x] **`src/pages/users/ProfilePage.tsx`** (100% coverage)
  - Test profile display and editing **(done)**
  - Test user data updates **(done)**

## Priority 3: Interview Management (Core Business Logic)

### 3.1 Interview Components

- [x] **`src/pages/interview/components/InterviewSession.tsx`** (100% coverage)
  - Test interview flow and state management **(done)**
  - Test question navigation **(done)**
- [x] **`src/pages/interview/components/KeystrokeRecordingTextarea.tsx`** (100% coverage)
  - Test keystroke recording functionality **(done)**
  - Test text input and recording state **(done)**
- [x] **`src/pages/interview/components/KeystrokeReplay.tsx`** (100% coverage)
  - Test keystroke replay functionality **(done)**
  - Test timing and playback controls **(done)**

### 3.2 Interview Management Pages

- [x] **`src/pages/interviews/index.tsx`** (100% coverage)
  - Test interview listing and filtering **(done)**
  - Test interview creation/deletion flows **(done)**
- [x] **`src/pages/interviews/components/CreateInterviewDialog.tsx`** (100% coverage)
  - Test interview creation form **(done)**
  - Test validation and submission **(done)**

### 3.3 Template Management

- [x] **`src/pages/interview-template/index.tsx`** (100% coverage)
  - Test template creation and editing **(done)**
- [x] **`src/pages/interview-templates/components/CreateTemplateDialog.tsx`** (100% coverage)
  - Test template creation form **(done)**

## Priority 4: Question & Template Management

### 4.1 Question Management

- [x] **`src/pages/question-bank/index.tsx`** (100% coverage)
  - Test question bank display and management **(done)**
- [x] **`src/pages/question-banks/components/CreateQuestionBankDialog.tsx`** (100% coverage)
  - Test question bank creation flow **(done)**

### 4.2 Template Management

- [x] **`src/pages/interview-template/index.tsx`** (100% coverage)
  - Test template creation and editing **(done)**
- [x] **`src/pages/interview-templates/components/CreateTemplateDialog.tsx`** (100% coverage)
  - Test template creation form **(done)**

## Priority 5: Dashboard & Navigation

### 5.1 Dashboard Pages

- [x] **`src/pages/dashboard/variants/AdminDashboard.tsx`** (100% coverage)
  - Test admin-specific dashboard features **(done)**
- [x] **`src/pages/dashboard/variants/CandidateDashboard.tsx`** (100% coverage)
  - Test candidate dashboard functionality **(done)**
- [x] **`src/pages/dashboard/variants/InterviewerDashboard.tsx`** (100% coverage)
  - Test interviewer dashboard features **(done)**

### 5.2 Navigation Components

- [x] **`src/components/AppSidebar.tsx`** (100% coverage)
  - Test sidebar navigation and role-based menu items **(done)**
- [x] **`src/components/Layout.tsx`** (100% coverage)
  - Test layout structure and responsive behavior **(done)**

## Priority 6: Advanced Features & Edge Cases

### 6.1 Interview Feedback

- [x] **`src/pages/interview-feedback/index.tsx`** (100% coverage)
  - Test feedback display and evaluation features **(done)**

### 6.2 Advanced Components

- [x] **`src/components/DropIndicator.tsx`** (100% coverage)
  - Test drag and drop functionality **(done)**
- [x] **`src/components/InterviewEvaluationIcon.tsx`** (100% coverage)
  - Test evaluation status display **(done)**

## Priority 7: Integration & End-to-End Testing

### 7.1 GraphQL Integration

- [ ] **`src/utils/createUrqlClient.ts`** (0% coverage)
  - Test client configuration and error handling
- [ ] **`src/contexts/UrqlClientContext.tsx`** (0% coverage)
  - Test GraphQL client context provider

### 7.2 Route Testing

- [ ] **`src/AppRoutes.tsx`** (0% coverage)
  - Test route configuration and protected routes
- [ ] **`src/components/PublicRoute.tsx`** (0% coverage)
  - Test public route handling

## Testing Guidelines

### What to Test

- ✅ **Business logic functions** (formatters, dates, utilities)
- ✅ **Custom hooks** (already well covered)
- ✅ **Complex components** with state management
- ✅ **Form handling** and validation
- ✅ **Error handling** and edge cases
- ✅ **Navigation** and routing logic

### What NOT to Test

- ❌ **shadcn/ui components** (already tested by library)
- ❌ **Simple prop-passing components** without logic
- ❌ **Third-party library configurations** (unless custom logic added)
- ❌ **Generated GraphQL code** (test the usage, not the generation)

### Testing Strategy

1. **Start with utilities** - High impact, low effort, no dependencies
2. **Move to components** - Test business logic and user interactions
3. **Test pages** - Focus on form handling and navigation
4. **Integration tests** - Test component interactions and data flow

### Coverage Goals

- **Utilities**: 100% (critical business logic)
- **Components**: 80%+ (focus on business logic, not UI rendering)
- **Pages**: 70%+ (focus on form handling and navigation)
- **Overall**: 60%+ (realistic target for React app)

## Next Steps

1. ✅ Start with Priority 1 utilities (formatters, dates, betterUpdateQuery) **(completed)**
2. ✅ Move to Priority 1 components (Breadcrumb, QuestionList, QuestionCard) **(completed)**
3. ✅ Focus on authentication flows (Priority 2) **(completed)**
4. ✅ Build up to complex interview management (Priority 3) **(completed)**
5. ✅ Move to dashboard and navigation components (Priority 5) **(completed)**
6. ✅ Move to navigation components (Priority 5.2) **(completed)**
7. ✅ Move to Layout component (Priority 5.2) **(completed)**
8. ✅ Move to Interview Feedback page (Priority 6.1) **(completed)**
9. ✅ Move to Advanced Components (Priority 6.2) **(completed)**
