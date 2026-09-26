import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { WebSearchResultEntity } from './web-search-result.entity';

@Entity({ name: 'web_searches' })
@Index(['userId', 'createdAt'])
@Index(['query'])
export class WebSearchEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 500 })
  query!: string;

  @Column({ name: 'result_count', type: 'int', default: 0 })
  resultCount!: number;

  @Column({ type: 'boolean', default: false })
  cached!: boolean;

  @ManyToOne(() => UserEntity, (u) => u.searches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @OneToMany(() => WebSearchResultEntity, (r) => r.search, { cascade: true })
  results!: WebSearchResultEntity[];
}
