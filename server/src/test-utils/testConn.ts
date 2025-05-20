import path from 'path';
import { DataSource } from 'typeorm';
import { Answer } from '../entities/Answer';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { Interview } from '../entities/Interview';
import { InterviewTemplate } from '../entities/InterviewTemplate';
import { Keystroke } from '../entities/Keystroke';
import { Question } from '../entities/Question';
import { Tag } from '../entities/Tag';
import { User } from '../entities/User';

export const testConn = (drop: boolean = false) => {
  return new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: 'simpleinterview-test',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: drop,
    dropSchema: drop,
    logging: false,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [
      User,
      CandidateInvitation,
      Interview,
      InterviewTemplate,
      Keystroke,
      Question,
      Answer,
      Tag,
    ],
  });
};
