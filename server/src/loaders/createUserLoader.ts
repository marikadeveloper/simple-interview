import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { User } from '../entities/User';

export const createUserLoader = () => {
  return new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({
      id: In(userIds as number[]),
    });
    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });
    return userIds.map((userId) => userIdToUser[userId]);
  });
};
