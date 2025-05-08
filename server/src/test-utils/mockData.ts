import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
import { Question } from '../entities/Question';
import { User, UserRole } from '../entities/User';

export const fakeUserData = (): Partial<User> => ({
  email: faker.internet.email() || '',
  fullName: faker.person.fullName(),
  password: faker.internet.password() || '',
});

export const createFakeUser = async (
  role: UserRole,
  overrides?: Partial<User>,
): Promise<User> => {
  // Hash the password before saving
  const data: Omit<User, 'id'> = { ...fakeUserData(), ...overrides } as Omit<
    User,
    'id'
  >;
  const password: string = await argon2.hash(data.password);
  const user = (await User.create({
    ...data,
    password,
    role,
  }).save()) as User;
  return user;
};

export const fakeQuestionData = (): Partial<Question> => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
});

export const createFakeQuestion = async (
  interviewTemplateId: number,
  overrides?: Partial<Question>,
): Promise<Question> => {
  const data: Omit<Question, 'id'> = {
    ...fakeQuestionData(),
    ...overrides,
  } as Omit<Question, 'id'>;
  const question = (await Question.create({
    ...data,
    interviewTemplate: { id: interviewTemplateId },
  }).save()) as Question;
  return question;
};
