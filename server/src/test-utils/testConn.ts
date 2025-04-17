import path from 'path';
import { DataSource } from 'typeorm';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { User } from '../entities/User';

export const testConn = (drop: boolean = false) => {
  return new DataSource({
    type: 'postgres',
    database: 'simpleinterview-test',
    username: process.env.POSTGRES_USER, // Use environment variable
    password: process.env.POSTGRES_PASSWORD, // Use environment variable
    synchronize: drop,
    dropSchema: drop,
    logging: false,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, CandidateInvitation],
  });
};
