import { EntityRepository, Repository } from 'typeorm';
import { Portal } from '../entities/portal.entity';

@EntityRepository(Portal)
export class PortalRepository extends Repository<Portal> {}
