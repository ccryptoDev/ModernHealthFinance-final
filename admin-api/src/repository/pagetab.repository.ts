import { EntityRepository, Repository } from 'typeorm';
import { Pagetabs } from '../entities/pagetab.entity';

@EntityRepository(Pagetabs)
export class PagetabsRepository extends Repository<Pagetabs> {}
