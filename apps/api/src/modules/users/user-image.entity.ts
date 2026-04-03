import { Entity, PrimaryKey, Property, ManyToOne, Ref } from '@mikro-orm/core';
import { User } from './users.entity';

@Entity({ tableName: 'user_images' })
export class UserImage {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @ManyToOne(() => User, { ref: true })
  user!: Ref<User>;

  @Property({ type: 'text' })
  filename!: string;

  @Property({ type: 'text' })
  mimeType!: string;

  @Property({ type: 'integer' })
  fileSizeBytes!: number;

  @Property({ type: 'text' })
  storageKey!: string;

  @Property({ type: 'text', nullable: true })
  imageUrl?: string;

  @Property({ type: 'boolean', default: false })
  isPrimary: boolean = false;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
