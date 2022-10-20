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

@Entity({ name: 'tblpages' })
export class Pages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  portal_id: number;

  @Column()
  order_no: number;

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
