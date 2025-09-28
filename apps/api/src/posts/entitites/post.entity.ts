import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostsCache {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unique: true })
  id_wp!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug!: string | null;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @CreateDateColumn()
  published_at?: Date;

  @UpdateDateColumn()
  modified_at?: Date;
}
