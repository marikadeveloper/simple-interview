import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AdminRegisterInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Answer = {
  __typename?: 'Answer';
  hasReplay: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  interview: Interview;
  keystrokes?: Maybe<Array<Keystroke>>;
  language: Scalars['String']['output'];
  question: Question;
  text: Scalars['String']['output'];
};

export type AuthInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type ChangePasswordInput = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type CreateAnswerInput = {
  interviewId: Scalars['Int']['input'];
  language?: Scalars['String']['input'];
  questionId: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type ForgotPasswordChangeInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type Interview = {
  __typename?: 'Interview';
  answers?: Maybe<Array<Answer>>;
  createdAt: Scalars['String']['output'];
  deadline: Scalars['String']['output'];
  evaluationNotes?: Maybe<Scalars['String']['output']>;
  evaluationValue?: Maybe<InterviewEvaluation>;
  id: Scalars['Int']['output'];
  interviewTemplate: InterviewTemplate;
  interviewer: User;
  status: InterviewStatus;
  updatedAt: Scalars['String']['output'];
  user: User;
};

/** Interview evaluation enumeration */
export enum InterviewEvaluation {
  Bad = 'BAD',
  Excellent = 'EXCELLENT',
  Good = 'GOOD'
}

export type InterviewEvaluationInput = {
  evaluationNotes?: InputMaybe<Scalars['String']['input']>;
  evaluationValue: InterviewEvaluation;
};

export type InterviewInput = {
  candidateId: Scalars['Int']['input'];
  deadline: Scalars['String']['input'];
  interviewTemplateId: Scalars['Int']['input'];
  interviewerId: Scalars['Int']['input'];
};

/** Interview status enumeration */
export enum InterviewStatus {
  Completed = 'COMPLETED',
  Expired = 'EXPIRED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type InterviewTemplate = {
  __typename?: 'InterviewTemplate';
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  questions: Array<Question>;
  tags?: Maybe<Array<Tag>>;
  updatedAt: Scalars['String']['output'];
};

export type InterviewTemplateInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tagsIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type Keystroke = {
  __typename?: 'Keystroke';
  relativeTimestamp: Scalars['Int']['output'];
  snapshot: Scalars['String']['output'];
};

export type KeystrokeInput = {
  relativeTimestamp: Scalars['Int']['input'];
  snapshot: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adminRegister?: Maybe<User>;
  changePassword?: Maybe<User>;
  confirmInterviewCompletion: Scalars['Boolean']['output'];
  createAnswer?: Maybe<Answer>;
  createInterview?: Maybe<Interview>;
  createInterviewTemplate?: Maybe<InterviewTemplate>;
  createQuestion?: Maybe<Question>;
  createTag?: Maybe<Tag>;
  deleteInterview: Scalars['Boolean']['output'];
  deleteInterviewTemplate: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  evaluateInterview: Scalars['Boolean']['output'];
  forgotPasswordChange: Scalars['Boolean']['output'];
  forgotPasswordRequest: Scalars['Boolean']['output'];
  login?: Maybe<User>;
  logout: Scalars['Boolean']['output'];
  saveKeystrokes: Scalars['Boolean']['output'];
  updateInterview?: Maybe<Interview>;
  updateInterviewTemplate?: Maybe<InterviewTemplate>;
  updateQuestion?: Maybe<Question>;
  updateQuestionSortOrder: Scalars['Boolean']['output'];
  updateTag?: Maybe<Tag>;
  userRegister?: Maybe<User>;
};


export type MutationAdminRegisterArgs = {
  input: AdminRegisterInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationConfirmInterviewCompletionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationCreateAnswerArgs = {
  input: CreateAnswerInput;
};


export type MutationCreateInterviewArgs = {
  input: InterviewInput;
};


export type MutationCreateInterviewTemplateArgs = {
  input: InterviewTemplateInput;
};


export type MutationCreateQuestionArgs = {
  input: QuestionInput;
  interviewTemplateId: Scalars['Int']['input'];
};


export type MutationCreateTagArgs = {
  text: Scalars['String']['input'];
};


export type MutationDeleteInterviewArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int']['input'];
};


export type MutationEvaluateInterviewArgs = {
  id: Scalars['Int']['input'];
  input: InterviewEvaluationInput;
};


export type MutationForgotPasswordChangeArgs = {
  input: ForgotPasswordChangeInput;
};


export type MutationForgotPasswordRequestArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: AuthInput;
};


export type MutationSaveKeystrokesArgs = {
  input: SaveKeystrokesInput;
};


export type MutationUpdateInterviewArgs = {
  id: Scalars['Int']['input'];
  input: InterviewInput;
};


export type MutationUpdateInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
  input: InterviewTemplateInput;
};


export type MutationUpdateQuestionArgs = {
  id: Scalars['Int']['input'];
  input: QuestionInput;
};


export type MutationUpdateQuestionSortOrderArgs = {
  input: UpdateQuestionSortOrderInput;
};


export type MutationUpdateTagArgs = {
  id: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};


export type MutationUserRegisterArgs = {
  input: PreRegisterInput;
};

export type PreRegisterInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  answer?: Maybe<Answer>;
  getCandidateInterview?: Maybe<Interview>;
  getInterview?: Maybe<Interview>;
  getInterviewTemplate?: Maybe<InterviewTemplate>;
  getInterviewTemplates?: Maybe<Array<InterviewTemplate>>;
  getInterviews?: Maybe<Array<Interview>>;
  getQuestions?: Maybe<Array<Question>>;
  getTags?: Maybe<Array<Tag>>;
  getUser?: Maybe<User>;
  /** Returns all users except the logged in user, if logged in as Interviewer only candidates are returned */
  getUsers?: Maybe<Array<User>>;
  me?: Maybe<User>;
};


export type QueryAnswerArgs = {
  id: Scalars['Float']['input'];
};


export type QueryGetCandidateInterviewArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetInterviewArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetInterviewTemplatesArgs = {
  tagsIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryGetQuestionsArgs = {
  interviewTemplateId: Scalars['Int']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetUsersArgs = {
  filters: UsersFilters;
};

export type Question = {
  __typename?: 'Question';
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  interviewTemplate: InterviewTemplate;
  sortOrder: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type QuestionInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type SaveKeystrokesInput = {
  answerId: Scalars['Int']['input'];
  keystrokes: Array<KeystrokeInput>;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type UpdateQuestionSortOrderInput = {
  newSortOrder: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  interviews?: Maybe<Array<Interview>>;
  interviewsAsInterviewer?: Maybe<Array<Interview>>;
  isActive: Scalars['Boolean']['output'];
  role: UserRole;
  updatedAt: Scalars['String']['output'];
};

/** User role enumeration */
export enum UserRole {
  Admin = 'ADMIN',
  Candidate = 'CANDIDATE',
  Interviewer = 'INTERVIEWER'
}

export type UsersFilters = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  /** If logged in as Interviewer, this field will always have value 'candidate' */
  role?: InputMaybe<UserRole>;
};

export type AnswerFragment = { __typename?: 'Answer', id: number, text: string, language: string, question: { __typename?: 'Question', id: number, title: string, description: string } };

export type AnswerWithKeystrokesFragment = { __typename?: 'Answer', id: number, text: string, language: string, keystrokes?: Array<{ __typename?: 'Keystroke', relativeTimestamp: number, snapshot: string }> | null, question: { __typename?: 'Question', id: number, title: string, description: string } };

export type InterviewListItemFragment = { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, evaluationValue?: InterviewEvaluation | null, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, interviewer: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } };

export type CandidateInterviewFragment = { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null };

export type ReplayInterviewFragment = { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, keystrokes?: Array<{ __typename?: 'Keystroke', relativeTimestamp: number, snapshot: string }> | null, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null };

export type FeedbackInterviewFragment = { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, evaluationValue?: InterviewEvaluation | null, evaluationNotes?: string | null, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null };

export type InterviewTemplateFragment = { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null };

export type InterviewTemplateWithQuestionsFragment = { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null };

export type KeystrokeFragment = { __typename?: 'Keystroke', relativeTimestamp: number, snapshot: string };

export type QuestionFragment = { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number };

export type QuestionWithInterviewTemplateFragment = { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } };

export type TagFragment = { __typename?: 'Tag', id: number, text: string };

export type UserFragment = { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } | null };

export type ConfirmInterviewCompletionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ConfirmInterviewCompletionMutation = { __typename?: 'Mutation', confirmInterviewCompletion: boolean };

export type CreateAnswerMutationVariables = Exact<{
  input: CreateAnswerInput;
}>;


export type CreateAnswerMutation = { __typename?: 'Mutation', createAnswer?: { __typename?: 'Answer', id: number } | null };

export type CreateInterviewMutationVariables = Exact<{
  input: InterviewInput;
}>;


export type CreateInterviewMutation = { __typename?: 'Mutation', createInterview?: { __typename?: 'Interview', id: number } | null };

export type CreateInterviewTemplateMutationVariables = Exact<{
  input: InterviewTemplateInput;
}>;


export type CreateInterviewTemplateMutation = { __typename?: 'Mutation', createInterviewTemplate?: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } | null };

export type CreateQuestionMutationVariables = Exact<{
  interviewTemplateId: Scalars['Int']['input'];
  input: QuestionInput;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', createQuestion?: { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number } | null };

export type CreateTagMutationVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag?: { __typename?: 'Tag', id: number, text: string } | null };

export type DeleteInterviewMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteInterviewMutation = { __typename?: 'Mutation', deleteInterview: boolean };

export type DeleteInterviewTemplateMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteInterviewTemplateMutation = { __typename?: 'Mutation', deleteInterviewTemplate: boolean };

export type DeleteQuestionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export type DeleteTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteTagMutation = { __typename?: 'Mutation', deleteTag: boolean };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type EvaluateInterviewMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: InterviewEvaluationInput;
}>;


export type EvaluateInterviewMutation = { __typename?: 'Mutation', evaluateInterview: boolean };

export type ForgotPasswordChangeMutationVariables = Exact<{
  input: ForgotPasswordChangeInput;
}>;


export type ForgotPasswordChangeMutation = { __typename?: 'Mutation', forgotPasswordChange: boolean };

export type ForgotPasswordRequestMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordRequestMutation = { __typename?: 'Mutation', forgotPasswordRequest: boolean };

export type LoginMutationVariables = Exact<{
  input: AuthInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type AdminRegisterMutationVariables = Exact<{
  input: AdminRegisterInput;
}>;


export type AdminRegisterMutation = { __typename?: 'Mutation', adminRegister?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } | null };

export type UserRegisterMutationVariables = Exact<{
  input: PreRegisterInput;
}>;


export type UserRegisterMutation = { __typename?: 'Mutation', userRegister?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } | null };

export type SaveKeystrokesMutationVariables = Exact<{
  input: SaveKeystrokesInput;
}>;


export type SaveKeystrokesMutation = { __typename?: 'Mutation', saveKeystrokes: boolean };

export type UpdateInterviewMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: InterviewInput;
}>;


export type UpdateInterviewMutation = { __typename?: 'Mutation', updateInterview?: { __typename?: 'Interview', id: number } | null };

export type UpdateInterviewTemplateMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: InterviewTemplateInput;
}>;


export type UpdateInterviewTemplateMutation = { __typename?: 'Mutation', updateInterviewTemplate?: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } | null };

export type UpdateQuestionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: QuestionInput;
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion?: { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number } | null };

export type UpdateQuestionSortOrderMutationVariables = Exact<{
  input: UpdateQuestionSortOrderInput;
}>;


export type UpdateQuestionSortOrderMutation = { __typename?: 'Mutation', updateQuestionSortOrder: boolean };

export type UpdateTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  text: Scalars['String']['input'];
}>;


export type UpdateTagMutation = { __typename?: 'Mutation', updateTag?: { __typename?: 'Tag', id: number, text: string } | null };

export type GetCandidateInterviewQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetCandidateInterviewQuery = { __typename?: 'Query', getCandidateInterview?: { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null } | null };

export type GetInterviewForReplayQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetInterviewForReplayQuery = { __typename?: 'Query', getInterview?: { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, keystrokes?: Array<{ __typename?: 'Keystroke', relativeTimestamp: number, snapshot: string }> | null, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null } | null };

export type GetInterviewForFeedbackQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetInterviewForFeedbackQuery = { __typename?: 'Query', getInterview?: { __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, evaluationValue?: InterviewEvaluation | null, evaluationNotes?: string | null, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, answers?: Array<{ __typename?: 'Answer', id: number, text: string, language: string, question: { __typename?: 'Question', id: number, title: string, description: string } }> | null } | null };

export type GetInterviewTemplateQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetInterviewTemplateQuery = { __typename?: 'Query', getInterviewTemplate?: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } | null };

export type GetInterviewTemplatesQueryVariables = Exact<{
  tagsIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type GetInterviewTemplatesQuery = { __typename?: 'Query', getInterviewTemplates?: Array<{ __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }> | null };

export type GetInterviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInterviewsQuery = { __typename?: 'Query', getInterviews?: Array<{ __typename?: 'Interview', id: number, deadline: string, status: InterviewStatus, evaluationValue?: InterviewEvaluation | null, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }, user: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }, interviewer: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } }> | null };

export type GetQuestionsQueryVariables = Exact<{
  interviewTemplateId: Scalars['Int']['input'];
}>;


export type GetQuestionsQuery = { __typename?: 'Query', getQuestions?: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, sortOrder: number }> | null };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', getTags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null };

export type GetUsersQueryVariables = Exact<{
  filters: UsersFilters;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers?: Array<{ __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean }> | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole, isActive: boolean } | null };

export const TagFragmentDoc = gql`
    fragment Tag on Tag {
  id
  text
}
    `;
export const InterviewTemplateFragmentDoc = gql`
    fragment InterviewTemplate on InterviewTemplate {
  id
  name
  description
  updatedAt
  createdAt
  tags {
    ...Tag
  }
}
    ${TagFragmentDoc}`;
export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
  fullName
  role
  isActive
}
    `;
export const InterviewListItemFragmentDoc = gql`
    fragment InterviewListItem on Interview {
  id
  interviewTemplate {
    ...InterviewTemplate
  }
  user {
    ...User
  }
  interviewer {
    ...User
  }
  deadline
  status
  evaluationValue
}
    ${InterviewTemplateFragmentDoc}
${UserFragmentDoc}`;
export const QuestionFragmentDoc = gql`
    fragment Question on Question {
  id
  title
  description
  updatedAt
  createdAt
  sortOrder
}
    `;
export const InterviewTemplateWithQuestionsFragmentDoc = gql`
    fragment InterviewTemplateWithQuestions on InterviewTemplate {
  ...InterviewTemplate
  questions {
    ...Question
  }
}
    ${InterviewTemplateFragmentDoc}
${QuestionFragmentDoc}`;
export const AnswerFragmentDoc = gql`
    fragment Answer on Answer {
  id
  text
  question {
    id
    title
    description
  }
  language
}
    `;
export const CandidateInterviewFragmentDoc = gql`
    fragment CandidateInterview on Interview {
  id
  interviewTemplate {
    ...InterviewTemplateWithQuestions
  }
  user {
    ...User
  }
  deadline
  status
  answers {
    ...Answer
  }
}
    ${InterviewTemplateWithQuestionsFragmentDoc}
${UserFragmentDoc}
${AnswerFragmentDoc}`;
export const KeystrokeFragmentDoc = gql`
    fragment Keystroke on Keystroke {
  relativeTimestamp
  snapshot
}
    `;
export const AnswerWithKeystrokesFragmentDoc = gql`
    fragment AnswerWithKeystrokes on Answer {
  ...Answer
  keystrokes {
    ...Keystroke
  }
}
    ${AnswerFragmentDoc}
${KeystrokeFragmentDoc}`;
export const ReplayInterviewFragmentDoc = gql`
    fragment ReplayInterview on Interview {
  id
  interviewTemplate {
    ...InterviewTemplateWithQuestions
  }
  user {
    ...User
  }
  deadline
  status
  answers {
    ...AnswerWithKeystrokes
  }
}
    ${InterviewTemplateWithQuestionsFragmentDoc}
${UserFragmentDoc}
${AnswerWithKeystrokesFragmentDoc}`;
export const FeedbackInterviewFragmentDoc = gql`
    fragment FeedbackInterview on Interview {
  id
  interviewTemplate {
    ...InterviewTemplateWithQuestions
  }
  user {
    ...User
  }
  deadline
  status
  answers {
    ...Answer
  }
  evaluationValue
  evaluationNotes
}
    ${InterviewTemplateWithQuestionsFragmentDoc}
${UserFragmentDoc}
${AnswerFragmentDoc}`;
export const QuestionWithInterviewTemplateFragmentDoc = gql`
    fragment QuestionWithInterviewTemplate on Question {
  id
  title
  description
  updatedAt
  createdAt
  interviewTemplate {
    ...InterviewTemplate
  }
}
    ${InterviewTemplateFragmentDoc}`;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const ConfirmInterviewCompletionDocument = gql`
    mutation ConfirmInterviewCompletion($id: Int!) {
  confirmInterviewCompletion(id: $id)
}
    `;

export function useConfirmInterviewCompletionMutation() {
  return Urql.useMutation<ConfirmInterviewCompletionMutation, ConfirmInterviewCompletionMutationVariables>(ConfirmInterviewCompletionDocument);
};
export const CreateAnswerDocument = gql`
    mutation CreateAnswer($input: CreateAnswerInput!) {
  createAnswer(input: $input) {
    id
  }
}
    `;

export function useCreateAnswerMutation() {
  return Urql.useMutation<CreateAnswerMutation, CreateAnswerMutationVariables>(CreateAnswerDocument);
};
export const CreateInterviewDocument = gql`
    mutation CreateInterview($input: InterviewInput!) {
  createInterview(input: $input) {
    id
  }
}
    `;

export function useCreateInterviewMutation() {
  return Urql.useMutation<CreateInterviewMutation, CreateInterviewMutationVariables>(CreateInterviewDocument);
};
export const CreateInterviewTemplateDocument = gql`
    mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
  createInterviewTemplate(input: $input) {
    ...InterviewTemplate
  }
}
    ${InterviewTemplateFragmentDoc}`;

export function useCreateInterviewTemplateMutation() {
  return Urql.useMutation<CreateInterviewTemplateMutation, CreateInterviewTemplateMutationVariables>(CreateInterviewTemplateDocument);
};
export const CreateQuestionDocument = gql`
    mutation CreateQuestion($interviewTemplateId: Int!, $input: QuestionInput!) {
  createQuestion(interviewTemplateId: $interviewTemplateId, input: $input) {
    ...Question
  }
}
    ${QuestionFragmentDoc}`;

export function useCreateQuestionMutation() {
  return Urql.useMutation<CreateQuestionMutation, CreateQuestionMutationVariables>(CreateQuestionDocument);
};
export const CreateTagDocument = gql`
    mutation CreateTag($text: String!) {
  createTag(text: $text) {
    ...Tag
  }
}
    ${TagFragmentDoc}`;

export function useCreateTagMutation() {
  return Urql.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument);
};
export const DeleteInterviewDocument = gql`
    mutation DeleteInterview($id: Int!) {
  deleteInterview(id: $id)
}
    `;

export function useDeleteInterviewMutation() {
  return Urql.useMutation<DeleteInterviewMutation, DeleteInterviewMutationVariables>(DeleteInterviewDocument);
};
export const DeleteInterviewTemplateDocument = gql`
    mutation DeleteInterviewTemplate($id: Int!) {
  deleteInterviewTemplate(id: $id)
}
    `;

export function useDeleteInterviewTemplateMutation() {
  return Urql.useMutation<DeleteInterviewTemplateMutation, DeleteInterviewTemplateMutationVariables>(DeleteInterviewTemplateDocument);
};
export const DeleteQuestionDocument = gql`
    mutation DeleteQuestion($id: Int!) {
  deleteQuestion(id: $id)
}
    `;

export function useDeleteQuestionMutation() {
  return Urql.useMutation<DeleteQuestionMutation, DeleteQuestionMutationVariables>(DeleteQuestionDocument);
};
export const DeleteTagDocument = gql`
    mutation DeleteTag($id: Int!) {
  deleteTag(id: $id)
}
    `;

export function useDeleteTagMutation() {
  return Urql.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(DeleteTagDocument);
};
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: Int!) {
  deleteUser(id: $id)
}
    `;

export function useDeleteUserMutation() {
  return Urql.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument);
};
export const EvaluateInterviewDocument = gql`
    mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
  evaluateInterview(id: $id, input: $input)
}
    `;

export function useEvaluateInterviewMutation() {
  return Urql.useMutation<EvaluateInterviewMutation, EvaluateInterviewMutationVariables>(EvaluateInterviewDocument);
};
export const ForgotPasswordChangeDocument = gql`
    mutation ForgotPasswordChange($input: ForgotPasswordChangeInput!) {
  forgotPasswordChange(input: $input)
}
    `;

export function useForgotPasswordChangeMutation() {
  return Urql.useMutation<ForgotPasswordChangeMutation, ForgotPasswordChangeMutationVariables>(ForgotPasswordChangeDocument);
};
export const ForgotPasswordRequestDocument = gql`
    mutation ForgotPasswordRequest($email: String!) {
  forgotPasswordRequest(email: $email)
}
    `;

export function useForgotPasswordRequestMutation() {
  return Urql.useMutation<ForgotPasswordRequestMutation, ForgotPasswordRequestMutationVariables>(ForgotPasswordRequestDocument);
};
export const LoginDocument = gql`
    mutation Login($input: AuthInput!) {
  login(input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const AdminRegisterDocument = gql`
    mutation AdminRegister($input: AdminRegisterInput!) {
  adminRegister(input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useAdminRegisterMutation() {
  return Urql.useMutation<AdminRegisterMutation, AdminRegisterMutationVariables>(AdminRegisterDocument);
};
export const UserRegisterDocument = gql`
    mutation UserRegister($input: PreRegisterInput!) {
  userRegister(input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useUserRegisterMutation() {
  return Urql.useMutation<UserRegisterMutation, UserRegisterMutationVariables>(UserRegisterDocument);
};
export const SaveKeystrokesDocument = gql`
    mutation SaveKeystrokes($input: SaveKeystrokesInput!) {
  saveKeystrokes(input: $input)
}
    `;

export function useSaveKeystrokesMutation() {
  return Urql.useMutation<SaveKeystrokesMutation, SaveKeystrokesMutationVariables>(SaveKeystrokesDocument);
};
export const UpdateInterviewDocument = gql`
    mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
  updateInterview(id: $id, input: $input) {
    id
  }
}
    `;

export function useUpdateInterviewMutation() {
  return Urql.useMutation<UpdateInterviewMutation, UpdateInterviewMutationVariables>(UpdateInterviewDocument);
};
export const UpdateInterviewTemplateDocument = gql`
    mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
  updateInterviewTemplate(id: $id, input: $input) {
    ...InterviewTemplate
  }
}
    ${InterviewTemplateFragmentDoc}`;

export function useUpdateInterviewTemplateMutation() {
  return Urql.useMutation<UpdateInterviewTemplateMutation, UpdateInterviewTemplateMutationVariables>(UpdateInterviewTemplateDocument);
};
export const UpdateQuestionDocument = gql`
    mutation UpdateQuestion($id: Int!, $input: QuestionInput!) {
  updateQuestion(id: $id, input: $input) {
    ...Question
  }
}
    ${QuestionFragmentDoc}`;

export function useUpdateQuestionMutation() {
  return Urql.useMutation<UpdateQuestionMutation, UpdateQuestionMutationVariables>(UpdateQuestionDocument);
};
export const UpdateQuestionSortOrderDocument = gql`
    mutation UpdateQuestionSortOrder($input: UpdateQuestionSortOrderInput!) {
  updateQuestionSortOrder(input: $input)
}
    `;

export function useUpdateQuestionSortOrderMutation() {
  return Urql.useMutation<UpdateQuestionSortOrderMutation, UpdateQuestionSortOrderMutationVariables>(UpdateQuestionSortOrderDocument);
};
export const UpdateTagDocument = gql`
    mutation UpdateTag($id: Int!, $text: String!) {
  updateTag(id: $id, text: $text) {
    ...Tag
  }
}
    ${TagFragmentDoc}`;

export function useUpdateTagMutation() {
  return Urql.useMutation<UpdateTagMutation, UpdateTagMutationVariables>(UpdateTagDocument);
};
export const GetCandidateInterviewDocument = gql`
    query GetCandidateInterview($id: Int!) {
  getCandidateInterview(id: $id) {
    ...CandidateInterview
  }
}
    ${CandidateInterviewFragmentDoc}`;

export function useGetCandidateInterviewQuery(options: Omit<Urql.UseQueryArgs<GetCandidateInterviewQueryVariables>, 'query'>) {
  return Urql.useQuery<GetCandidateInterviewQuery, GetCandidateInterviewQueryVariables>({ query: GetCandidateInterviewDocument, ...options });
};
export const GetInterviewForReplayDocument = gql`
    query GetInterviewForReplay($id: Int!) {
  getInterview(id: $id) {
    ...ReplayInterview
  }
}
    ${ReplayInterviewFragmentDoc}`;

export function useGetInterviewForReplayQuery(options: Omit<Urql.UseQueryArgs<GetInterviewForReplayQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInterviewForReplayQuery, GetInterviewForReplayQueryVariables>({ query: GetInterviewForReplayDocument, ...options });
};
export const GetInterviewForFeedbackDocument = gql`
    query GetInterviewForFeedback($id: Int!) {
  getInterview(id: $id) {
    ...FeedbackInterview
  }
}
    ${FeedbackInterviewFragmentDoc}`;

export function useGetInterviewForFeedbackQuery(options: Omit<Urql.UseQueryArgs<GetInterviewForFeedbackQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInterviewForFeedbackQuery, GetInterviewForFeedbackQueryVariables>({ query: GetInterviewForFeedbackDocument, ...options });
};
export const GetInterviewTemplateDocument = gql`
    query GetInterviewTemplate($id: Int!) {
  getInterviewTemplate(id: $id) {
    ...InterviewTemplateWithQuestions
  }
}
    ${InterviewTemplateWithQuestionsFragmentDoc}`;

export function useGetInterviewTemplateQuery(options: Omit<Urql.UseQueryArgs<GetInterviewTemplateQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInterviewTemplateQuery, GetInterviewTemplateQueryVariables>({ query: GetInterviewTemplateDocument, ...options });
};
export const GetInterviewTemplatesDocument = gql`
    query GetInterviewTemplates($tagsIds: [Int!]) {
  getInterviewTemplates(tagsIds: $tagsIds) {
    ...InterviewTemplate
  }
}
    ${InterviewTemplateFragmentDoc}`;

export function useGetInterviewTemplatesQuery(options?: Omit<Urql.UseQueryArgs<GetInterviewTemplatesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInterviewTemplatesQuery, GetInterviewTemplatesQueryVariables>({ query: GetInterviewTemplatesDocument, ...options });
};
export const GetInterviewsDocument = gql`
    query GetInterviews {
  getInterviews {
    ...InterviewListItem
  }
}
    ${InterviewListItemFragmentDoc}`;

export function useGetInterviewsQuery(options?: Omit<Urql.UseQueryArgs<GetInterviewsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetInterviewsQuery, GetInterviewsQueryVariables>({ query: GetInterviewsDocument, ...options });
};
export const GetQuestionsDocument = gql`
    query GetQuestions($interviewTemplateId: Int!) {
  getQuestions(interviewTemplateId: $interviewTemplateId) {
    ...Question
  }
}
    ${QuestionFragmentDoc}`;

export function useGetQuestionsQuery(options: Omit<Urql.UseQueryArgs<GetQuestionsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetQuestionsQuery, GetQuestionsQueryVariables>({ query: GetQuestionsDocument, ...options });
};
export const GetTagsDocument = gql`
    query GetTags {
  getTags {
    ...Tag
  }
}
    ${TagFragmentDoc}`;

export function useGetTagsQuery(options?: Omit<Urql.UseQueryArgs<GetTagsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetTagsQuery, GetTagsQueryVariables>({ query: GetTagsDocument, ...options });
};
export const GetUsersDocument = gql`
    query GetUsers($filters: UsersFilters!) {
  getUsers(filters: $filters) {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useGetUsersQuery(options: Omit<Urql.UseQueryArgs<GetUsersQueryVariables>, 'query'>) {
  return Urql.useQuery<GetUsersQuery, GetUsersQueryVariables>({ query: GetUsersDocument, ...options });
};
export const MeDocument = gql`
    query Me {
  me {
    ...User
  }
}
    ${UserFragmentDoc}`;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};