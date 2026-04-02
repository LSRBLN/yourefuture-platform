import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { UserImage } from './user-image.entity';
import { UserSession } from './user-session.entity';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @Property({ type: 'text', unique: true })
  email!: string;

  @Property({ type: 'text' })
  passwordHash!: string;

  @Property({ type: 'text', nullable: true })
  firstName?: string;

  @Property({ type: 'text', nullable: true })
  lastName?: string;

  @Property({ type: 'text', nullable: true })
  bio?: string;

  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Property({ type: 'text', default: 'de' })
  language: string = 'de';

  @Property({ type: 'text', default: 'dark' })
  theme: string = 'dark';

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'boolean', default: false })
  emailVerified: boolean = false;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => UserImage, (image) => image.user)
  images = new Collection<UserImage>(this);

  @OneToMany(() => UserSession, (session) => session.user)
  sessions = new Collection<UserSession>(this);
}
