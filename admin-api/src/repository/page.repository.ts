import { EntityRepository, Repository } from 'typeorm';
import { Pages } from '../entities/page.entity';

@EntityRepository(Pages)
export class PagesRepository extends Repository<Pages> {}
