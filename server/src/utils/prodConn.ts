import path from 'path';
import { DataSource } from 'typeorm';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { User } from '../entities/User';

export const prodConn = () =>
  new DataSource({
    type: 'postgres',
    database: 'simpleinterview',
    username: process.env.POSTGRES_USER, // Use environment variable
    password: process.env.POSTGRES_PASSWORD, // Use environment variable
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, CandidateInvitation],
  });
