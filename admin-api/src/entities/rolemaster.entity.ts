import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y',
}

@Entity({ name: 'tblrolesmaster' })
export class Rolesmaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role_id: number;

  @Column()
  portal_id: number;

  @Column()
  pages_id: number;

  @Column()
  pagetabs_id: number;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
