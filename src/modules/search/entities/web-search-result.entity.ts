import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { WebSearchEntity } from './web-search.entity';

@Entity({ name: 'web_search_results' })
@Index(['searchId'])
export class WebSearchResultEntity extends BaseEntity {
  @Column({ name: 'search_id', type: 'uuid' })
  searchId!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'varchar', length: 1000 })
  url!: string;

  @Column({ type: 'text', nullable: true })
  snippet?: string | null;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => WebSearchEntity, (s) => s.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'search_id' })
  search!: WebSearchEntity;
}
