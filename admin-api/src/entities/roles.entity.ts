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

@Entity({ name: 'tblroles' })
export class Roles extends BaseEntity {
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
  edit_flag: Flags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
