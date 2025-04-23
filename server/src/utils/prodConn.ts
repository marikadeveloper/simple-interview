import path from 'path';
import { DataSource } from 'typeorm';
import { Answer } from '../entities/Answer';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { Interview } from '../entities/Interview';
import { InterviewTemplate } from '../entities/InterviewTemplate';
import { Keystroke } from '../entities/Keystroke';
import { Question } from '../entities/Question';
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
    entities: [
      User,
      CandidateInvitation,
      Interview,
      InterviewTemplate,
      Keystroke,
      Question,
      Answer,
    ],
  });
