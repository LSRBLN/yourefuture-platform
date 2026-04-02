import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { User } from './users.entity';

@Entity({ tableName: 'user_sessions' })
export class UserSession {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @ManyToOne(() => User, { ref: true })
  user!: Ref<User>;

  @Property({ type: 'text', unique: true })
  token!: string;

  @Property({ type: 'date' })
  expiresAt!: Date;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
