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

@Entity({ name: 'tblportal' })
export class Portal extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.Y,
  })
  active_flag: Flags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
