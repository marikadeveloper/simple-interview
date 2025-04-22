import { faker } from '@faker-js/faker';
import { User, UserRole } from '../entities/User';

export const fakeUserData = () => ({
  email: faker.internet.email(),
  fullName: faker.person.fullName(),
  password: faker.internet.password(),
});

export const createFakeUser = async (role: UserRole) => {
  const user = await User.create({
    ...fakeUserData(),
    role,
  }).save();
  return user;
};
