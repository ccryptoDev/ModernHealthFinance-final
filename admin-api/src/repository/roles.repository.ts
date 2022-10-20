import { EntityRepository, Repository } from 'typeorm';
import { Roles } from '../entities/roles.entity';

@EntityRepository(Roles)
export class RolesRepository extends Repository<Roles> {}
