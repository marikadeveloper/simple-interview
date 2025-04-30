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

export type Answer = {
  __typename?: 'Answer';
  hasReplay: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  interview: Interview;
  keystrokes?: Maybe<Array<Keystroke>>;
  question: Question;
  text: Scalars['String']['output'];
};

export type AuthInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type CandidatesFilters = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
};

export type ChangePasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type Interview = {
  __typename?: 'Interview';
  answers: Answer;
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  interviewTemplate: InterviewTemplate;
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  user: User;
};

export type InterviewTemplate = {
  __typename?: 'InterviewTemplate';
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Keystroke = {
  __typename?: 'Keystroke';
  answer: Answer;
  id: Scalars['Int']['output'];
  length?: Maybe<Scalars['Int']['output']>;
  position: Scalars['Int']['output'];
  relativeTimestamp: Scalars['Int']['output'];
  timestamp: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type KeystrokeInput = {
  length?: InputMaybe<Scalars['Int']['input']>;
  position: Scalars['Int']['input'];
  relativeTimestamp: Scalars['Int']['input'];
  type: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  adminRegister: AuthResponse;
  candidateRegister: AuthResponse;
  changePassword: AuthResponse;
  createCandidateInvitation: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  interviewerRegister: AuthResponse;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  saveKeystrokes: Scalars['Boolean']['output'];
};


export type MutationAdminRegisterArgs = {
  input: RegisterInput;
};


export type MutationCandidateRegisterArgs = {
  input: RegisterInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateCandidateInvitationArgs = {
  email: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationInterviewerRegisterArgs = {
  input: RegisterInput;
};


export type MutationLoginArgs = {
  input: AuthInput;
};


export type MutationSaveKeystrokesArgs = {
  input: SaveKeystrokesInput;
};

export type Query = {
  __typename?: 'Query';
  getCandidates: Array<User>;
  getKeystrokes?: Maybe<Array<Keystroke>>;
  getUsers: Array<User>;
  me?: Maybe<AuthResponse>;
};


export type QueryGetCandidatesArgs = {
  filters: CandidatesFilters;
};


export type QueryGetKeystrokesArgs = {
  answerId: Scalars['Float']['input'];
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
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SaveKeystrokesInput = {
  answerId: Scalars['Int']['input'];
  keystrokes: Array<KeystrokeInput>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type UsersFilters = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type AuthResponseFragment = { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null };

export type ErrorFragment = { __typename?: 'FieldError', field: string, message: string };

export type UserFragment = { __typename?: 'User', id: number, email: string, fullName: string, role: string };

export type LoginMutationVariables = Exact<{
  input: AuthInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type AdminRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type AdminRegisterMutation = { __typename?: 'Mutation', adminRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type InterviewerRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type InterviewerRegisterMutation = { __typename?: 'Mutation', interviewerRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type CandidateRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type CandidateRegisterMutation = { __typename?: 'Mutation', candidateRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type SaveKeystrokesMutationVariables = Exact<{
  input: SaveKeystrokesInput;
}>;


export type SaveKeystrokesMutation = { __typename?: 'Mutation', saveKeystrokes: boolean };

export type GetKeystrokesQueryVariables = Exact<{
  answerId: Scalars['Float']['input'];
}>;


export type GetKeystrokesQuery = { __typename?: 'Query', getKeystrokes?: Array<{ __typename?: 'Keystroke', id: number, type: string, value?: string | null, position: number, length?: number | null, timestamp: string, relativeTimestamp: number }> | null };

export type GetUsersQueryVariables = Exact<{
  filters: UsersFilters;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', id: number, email: string, fullName: string, role: string }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: string } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } | null };

export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
  fullName
  role
}
    `;
export const ErrorFragmentDoc = gql`
    fragment Error on FieldError {
  field
  message
}
    `;
export const AuthResponseFragmentDoc = gql`
    fragment AuthResponse on AuthResponse {
  user {
    ...User
  }
  errors {
    ...Error
  }
}
    ${UserFragmentDoc}
${ErrorFragmentDoc}`;
export const LoginDocument = gql`
    mutation Login($input: AuthInput!) {
  login(input: $input) {
    ...AuthResponse
  }
}
    ${AuthResponseFragmentDoc}`;

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
    mutation AdminRegister($input: RegisterInput!) {
  adminRegister(input: $input) {
    ...AuthResponse
  }
}
    ${AuthResponseFragmentDoc}`;

export function useAdminRegisterMutation() {
  return Urql.useMutation<AdminRegisterMutation, AdminRegisterMutationVariables>(AdminRegisterDocument);
};
export const InterviewerRegisterDocument = gql`
    mutation InterviewerRegister($input: RegisterInput!) {
  interviewerRegister(input: $input) {
    ...AuthResponse
  }
}
    ${AuthResponseFragmentDoc}`;

export function useInterviewerRegisterMutation() {
  return Urql.useMutation<InterviewerRegisterMutation, InterviewerRegisterMutationVariables>(InterviewerRegisterDocument);
};
export const CandidateRegisterDocument = gql`
    mutation CandidateRegister($input: RegisterInput!) {
  candidateRegister(input: $input) {
    ...AuthResponse
  }
}
    ${AuthResponseFragmentDoc}`;

export function useCandidateRegisterMutation() {
  return Urql.useMutation<CandidateRegisterMutation, CandidateRegisterMutationVariables>(CandidateRegisterDocument);
};
export const SaveKeystrokesDocument = gql`
    mutation SaveKeystrokes($input: SaveKeystrokesInput!) {
  saveKeystrokes(input: $input)
}
    `;

export function useSaveKeystrokesMutation() {
  return Urql.useMutation<SaveKeystrokesMutation, SaveKeystrokesMutationVariables>(SaveKeystrokesDocument);
};
export const GetKeystrokesDocument = gql`
    query GetKeystrokes($answerId: Float!) {
  getKeystrokes(answerId: $answerId) {
    id
    type
    value
    position
    length
    timestamp
    relativeTimestamp
  }
}
    `;

export function useGetKeystrokesQuery(options: Omit<Urql.UseQueryArgs<GetKeystrokesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetKeystrokesQuery, GetKeystrokesQueryVariables>({ query: GetKeystrokesDocument, ...options });
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
    user {
      ...User
    }
    errors {
      ...Error
    }
  }
}
    ${UserFragmentDoc}
${ErrorFragmentDoc}`;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};