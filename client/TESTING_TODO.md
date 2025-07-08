# Testing TODO - Prioritized List

## Current Status

- **Overall Coverage**: 70.88% statements, 87.77% branches, 67.05% functions
- **Well Tested**: Most core components, utility functions, and business logic. See below for details. Some hooks and dialog/action components are not fully covered.
- **Needs Testing**: Some hooks (e.g., useIsMobile), dialog/action components, and a few business logic and integration flows.

## Priority 1: Critical Business Logic & Utilities (High Impact, Low Effort)

### 1.1 Utility Functions (100% coverage)

- [x] **`src/utils/formatters.ts`** - `pathnameToBreadcrumbLabel` function (100%)
  - Test path conversion logic (dash to space, capitalization) **(done)**
  - Test edge cases (empty string, single word, multiple dashes) **(done)**
- [x] **`src/utils/dates.ts`** - Date formatting functions (100%)
  - Test `formatDate`, `formatDateTime`, `formatDateRelative` **(done)**
  - Test with various date formats and edge cases **(done)**
- [x] **`src/utils/betterUpdateQuery.ts`** - GraphQL cache utility (100%)
  - Test cache update logic **(done)**
  - Test with null/undefined data scenarios **(done)**
- [x] **`src/utils/debounce.ts`** - Debounce utility (100%)
  - Test debounce functionality **(done)**
- [x] **`src/lib/utils.ts`** - Utility functions (100%)
  - Test utility functions **(done)**
- [ ] **`src/utils/createUrqlClient.ts`** (29% coverage)
  - Test client configuration and error handling (needs more tests)

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
- [x] **`src/pages/interview/components/KeystrokeRecordingTextarea.tsx`** (99% coverage)
  - Test keystroke recording functionality **(done)**
  - Test text input and recording state **(done)**
- [x] **`src/pages/interview/components/KeystrokeReplay.tsx`** (94% coverage)
  - Test keystroke replay functionality **(done)**
  - Test timing and playback controls **(done)**

### 3.2 Interview Management Pages

- [x] **`src/pages/interviews/index.tsx`** (100% coverage)
  - Test interview listing and filtering **(done)**
  - Test interview creation/deletion flows **(done)**
- [x] **`src/pages/interviews/components/CreateInterviewDialog.tsx`** (99.7% coverage)
  - Test interview creation form **(done)**
  - Test validation and submission **(done)**

### 3.3 Template Management

- [x] **`src/pages/interview-template/index.tsx`** (100% coverage)
  - Test template creation and editing **(done)**
- [x] **`src/pages/interview-templates/components/CreateTemplateDialog.tsx`** (86.5% coverage)
  - Test template creation form **(done)**

## Priority 4: Question & Template Management

### 4.1 Question Management

- [x] **`src/pages/question-bank/index.tsx`** (0% coverage - needs testing)
  - Test question bank display and management
- [x] **`src/pages/question-banks/components/CreateQuestionBankDialog.tsx`** (100% coverage)
  - Test question bank creation flow **(done)**

### 4.2 Template Management

- [x] **`src/pages/interview-template/index.tsx`** (100% coverage)
  - Test template creation and editing **(done)**
- [x] **`src/pages/interview-templates/components/CreateTemplateDialog.tsx`** (86.5% coverage)
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

- [x] **`src/pages/interview-feedback/index.tsx`** (99.4% coverage)
  - Test feedback display and evaluation features **(done)**

### 6.2 Advanced Components

- [x] **`src/components/InterviewEvaluationIcon.tsx`** (100% coverage)
  - Test evaluation status display **(done)**

## Priority 7: Integration & End-to-End Testing

### 7.1 GraphQL Integration

- [x] **`src/utils/createUrqlClient.ts`** (29% coverage)
  - Test client configuration and error handling (needs more tests)
- [x] **`src/contexts/UrqlClientContext.tsx`** (100% coverage)
  - Test GraphQL client context provider **(done)**

### 7.2 Route Testing

- [x] **`src/components/PublicRoute.tsx`** (100% coverage)
  - Test public route handling **(done)**

## Priority 8: Remaining Components (Low Coverage Areas)

### 8.1 Auth Context

- [x] **`src/contexts/AuthContext.tsx`** (100% coverage)
  - Test authentication state management **(done)**
  - Test login/logout flows **(done)**
  - Test user role handling **(done)**

### 8.2 Main Application Files

- [x] **`src/App.tsx`** (100% coverage)
  - Test main app component **(done)**
  - Test routing setup **(done)**

### 8.3 Interview Pages

- [x] **`src/pages/interview/index.tsx`** (100% coverage)
  - Test interview page routing **(done)**
- [x] **`src/pages/interview/variants/CandidateInterview.tsx`** (100% coverage)
  - Test candidate interview flow **(done)**
- [x] **`src/pages/interview/variants/ReadonlyInterview.tsx`** (100% coverage)
  - Test readonly interview display **(done)**

### 8.4 Dashboard Pages

- [x] **`src/pages/dashboard/index.tsx`** (100% coverage)
  - Test dashboard routing logic **(done)**

### 8.5 Management Pages

- [x] **`src/pages/interview-templates/index.tsx`** (95% coverage)
  - Test template listing and management **(done)**
- [x] **`src/pages/question-banks/index.tsx`** (98% coverage)
  - Test question bank listing **(done)**
- [x] **`src/pages/users/index.tsx`** (98% coverage)
  - Test user management page **(done)**

### 8.6 Dialog Components

- [x] **`src/pages/interview-templates/components/DeleteTemplateConfirmationDialog.tsx`** (100% coverage)
  - Test template deletion confirmation **(done)**
- [x] **`src/pages/interviews/components/DeleteInterviewConfirmationDialog.tsx`** (91% coverage)
  - Test interview deletion confirmation **(done)**
- [x] **`src/pages/interviews/components/InterviewCard.tsx`** (94% coverage)
  - Test interview card display **(done)**
- [x] **`src/pages/interviews/components/UpdateInterviewDialog.tsx`** (93% coverage)
  - Test interview update dialog **(done)**
- [x] **`src/pages/question-banks/components/DeleteQuestionBankConfirmationDialog.tsx`** (100% coverage)
  - Test question bank deletion confirmation
- [x] **`src/pages/users/components/CreateUserDialog.tsx`** (100% coverage)
  - Test user creation dialog **(done)**
- [x] **`src/pages/users/components/DeleteUserConfirmationDialog.tsx`** (100% coverage)
  - Test user deletion confirmation **(done)**

### 8.7 Navigation Components

- [x] **`src/components/MobileNavigationLink.tsx`** (95% coverage)
  - Test mobile navigation link **(done)**
- [x] **`src/components/NavigationLink.tsx`** (100% coverage)
  - Test navigation link component **(done)**

### 8.8 Hooks

- [x] **`src/hooks/useIsMobile.ts`** (100% coverage)
  - Test mobile detection hook **(done)**

### 8.9 Auth Pages

- [x] **`src/pages/auth/AdminSignupPage.tsx`** (96% coverage)
  - Test admin signup flow **(done)**
- [x] **`src/pages/auth/FirstPasswordChangePage.tsx`** (100% coverage)
  - Test first password change flow **(done)**
- [x] **`src/pages/auth/NotAuthorizedPage.tsx`** (100% coverage)
  - Test unauthorized page **(done)**
- [x] **`src/pages/auth/NotFoundPage.tsx`** (100% coverage)
  - Test 404 page **(done)**

### 8.10 Interview Template Components

- [x] **`src/pages/interview-template/components/FormHeading.tsx`** (86% coverage)
  - Test form heading component **(done)**
- [x] **`src/pages/interview-template/components/QuestionBankSelector.tsx`** (85% coverage)
  - Test question bank selector **(done)**
- [x] **`src/pages/interview-template/components/ReadonlyHeading.tsx`** (100% coverage)
  - Test readonly heading component **(done)**
- [x] **`src/pages/interview-template/components/utils.ts`** (100% coverage)
  - Test template utility functions **(done)**

### 8.11 Question Bank Components

- [x] **`src/pages/question-bank/components/FormHeading.tsx`** (100% coverage)
  - Test form heading component **(done)**
- [x] **`src/pages/question-bank/components/ReadonlyHeading.tsx`** (100% coverage)
  - Test readonly heading component **(done)**

### 8.12 Interview Components

- [x] **`src/pages/interview/components/QuestionCard.tsx`** (100% coverage)
  - Test interview question card **(done)**

### 8.13 Column Definitions

- [x] **`src/pages/interview-templates/columns.tsx`** (100% coverage)
  - Test template column definitions **(done)**
- [x] **`src/pages/interviews/columns.tsx`** (95% coverage)
  - Test interview column definitions **(done)**
- [x] **`src/pages/question-banks/columns.tsx`** (100% coverage)
  - Test question bank column definitions **(done)**
- [x] **`src/pages/users/columns.tsx`** (100% coverage)
  - Test user column definitions **(done)**

### 8.14 Variant Pages

- [x] **`src/pages/interviews/variants/AdminInterviews.tsx`** (100% coverage)
  - Test admin interviews page **(done)**
- [x] **`src/pages/interviews/variants/CandidateInterviews.tsx`** (100% coverage)
  - Test candidate interviews page **(done)**

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

## Next Steps (as of latest coverage)

1. **Increase coverage for low-coverage files:**
   - `src/hooks/useIsMobile.ts` (currently 0%)
   - `src/pages/question-bank/index.tsx` (currently 0%)
   - `src/pages/question-bank/components/FormHeading.tsx` (currently 0%)
   - Dialog/action components with <70% coverage (see above)
2. **Focus on branch/function coverage for components in the 70-95% range.**
3. **Add more tests for edge cases and error handling in dialog/action components.**
4. **Review hooks and utility files for any missed edge cases.**
5. **Maintain high coverage for business logic and core flows.**
6. **Re-run coverage after each major test addition to track progress.**
