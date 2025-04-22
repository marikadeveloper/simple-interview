import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
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
