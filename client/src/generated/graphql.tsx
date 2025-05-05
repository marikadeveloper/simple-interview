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

export type CandidateInvitation = {
  __typename?: 'CandidateInvitation';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  used: Scalars['Boolean']['output'];
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
  createInterviewTemplate: InterviewTemplate;
  createTag: Tag;
  deleteInterviewTemplate: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  interviewerRegister: AuthResponse;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  saveKeystrokes: Scalars['Boolean']['output'];
  updateInterviewTemplate: InterviewTemplate;
  updateTag: Tag;
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


export type MutationCreateInterviewTemplateArgs = {
  input: InterviewTemplateInput;
};


export type MutationCreateTagArgs = {
  text: Scalars['String']['input'];
};


export type MutationDeleteInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['Int']['input'];
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


export type MutationUpdateInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
  input: InterviewTemplateInput;
};


export type MutationUpdateTagArgs = {
  id: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getCandidateInvitations: Array<CandidateInvitation>;
  getInterviewTemplate?: Maybe<InterviewTemplate>;
  getInterviewTemplates: Array<InterviewTemplate>;
  getKeystrokes?: Maybe<Array<Keystroke>>;
  getTags: Array<Tag>;
  /** Returns all users except the logged in user, if logged in as Interviewer only candidates are returned */
  getUsers: Array<User>;
  me?: Maybe<AuthResponse>;
};


export type QueryGetCandidateInvitationsArgs = {
  used?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetInterviewTemplateArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetInterviewTemplatesArgs = {
  tagsIds?: InputMaybe<Array<Scalars['Int']['input']>>;
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

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
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
  role?: InputMaybe<Scalars['String']['input']>;
};

export type AuthResponseFragment = { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null };

export type ErrorFragment = { __typename?: 'FieldError', field: string, message: string };

export type InterviewTemplateFragment = { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null };

export type InterviewTemplateWithQuestionsFragment = { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null };

export type QuestionFragment = { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string };

export type QuestionWithInterviewTemplateFragment = { __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string, interviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } };

export type TagFragment = { __typename?: 'Tag', id: number, text: string };

export type UserFragment = { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole };

export type CreateCandidateInvitationMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type CreateCandidateInvitationMutation = { __typename?: 'Mutation', createCandidateInvitation: boolean };

export type CreateInterviewTemplateMutationVariables = Exact<{
  input: InterviewTemplateInput;
}>;


export type CreateInterviewTemplateMutation = { __typename?: 'Mutation', createInterviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } };

export type CreateTagMutationVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag: { __typename?: 'Tag', id: number, text: string } };

export type DeleteInterviewTemplateMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteInterviewTemplateMutation = { __typename?: 'Mutation', deleteInterviewTemplate: boolean };

export type DeleteTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteTagMutation = { __typename?: 'Mutation', deleteTag: boolean };

export type LoginMutationVariables = Exact<{
  input: AuthInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type AdminRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type AdminRegisterMutation = { __typename?: 'Mutation', adminRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type InterviewerRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type InterviewerRegisterMutation = { __typename?: 'Mutation', interviewerRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type CandidateRegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type CandidateRegisterMutation = { __typename?: 'Mutation', candidateRegister: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type SaveKeystrokesMutationVariables = Exact<{
  input: SaveKeystrokesInput;
}>;


export type SaveKeystrokesMutation = { __typename?: 'Mutation', saveKeystrokes: boolean };

export type UpdateInterviewTemplateMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: InterviewTemplateInput;
}>;


export type UpdateInterviewTemplateMutation = { __typename?: 'Mutation', updateInterviewTemplate: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } };

export type UpdateTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  text: Scalars['String']['input'];
}>;


export type UpdateTagMutation = { __typename?: 'Mutation', updateTag: { __typename?: 'Tag', id: number, text: string } };

export type GetCandidateInvitationsQueryVariables = Exact<{
  used?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCandidateInvitationsQuery = { __typename?: 'Query', getCandidateInvitations: Array<{ __typename?: 'CandidateInvitation', id: number, email: string, used: boolean, createdAt: string }> };

export type GetInterviewTemplateQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetInterviewTemplateQuery = { __typename?: 'Query', getInterviewTemplate?: { __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, questions: Array<{ __typename?: 'Question', id: number, title: string, description: string, updatedAt: string, createdAt: string }>, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null } | null };

export type GetInterviewTemplatesQueryVariables = Exact<{
  tagsIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type GetInterviewTemplatesQuery = { __typename?: 'Query', getInterviewTemplates: Array<{ __typename?: 'InterviewTemplate', id: number, name: string, description: string, updatedAt: string, createdAt: string, tags?: Array<{ __typename?: 'Tag', id: number, text: string }> | null }> };

export type GetKeystrokesQueryVariables = Exact<{
  answerId: Scalars['Float']['input'];
}>;


export type GetKeystrokesQuery = { __typename?: 'Query', getKeystrokes?: Array<{ __typename?: 'Keystroke', id: number, type: string, value?: string | null, position: number, length?: number | null, timestamp: string, relativeTimestamp: number }> | null };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', getTags: Array<{ __typename?: 'Tag', id: number, text: string }> };

export type GetUsersQueryVariables = Exact<{
  filters: UsersFilters;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', id: number, email: string, fullName: string, role: UserRole }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'AuthResponse', user?: { __typename?: 'User', id: number, email: string, fullName: string, role: UserRole } | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } | null };

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
export const QuestionFragmentDoc = gql`
    fragment Question on Question {
  id
  title
  description
  updatedAt
  createdAt
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
export const CreateCandidateInvitationDocument = gql`
    mutation CreateCandidateInvitation($email: String!) {
  createCandidateInvitation(email: $email)
}
    `;

export function useCreateCandidateInvitationMutation() {
  return Urql.useMutation<CreateCandidateInvitationMutation, CreateCandidateInvitationMutationVariables>(CreateCandidateInvitationDocument);
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
export const DeleteInterviewTemplateDocument = gql`
    mutation DeleteInterviewTemplate($id: Int!) {
  deleteInterviewTemplate(id: $id)
}
    `;

export function useDeleteInterviewTemplateMutation() {
  return Urql.useMutation<DeleteInterviewTemplateMutation, DeleteInterviewTemplateMutationVariables>(DeleteInterviewTemplateDocument);
};
export const DeleteTagDocument = gql`
    mutation DeleteTag($id: Int!) {
  deleteTag(id: $id)
}
    `;

export function useDeleteTagMutation() {
  return Urql.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(DeleteTagDocument);
};
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
export const GetCandidateInvitationsDocument = gql`
    query GetCandidateInvitations($used: Boolean) {
  getCandidateInvitations(used: $used) {
    id
    email
    used
    createdAt
  }
}
    `;

export function useGetCandidateInvitationsQuery(options?: Omit<Urql.UseQueryArgs<GetCandidateInvitationsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetCandidateInvitationsQuery, GetCandidateInvitationsQueryVariables>({ query: GetCandidateInvitationsDocument, ...options });
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