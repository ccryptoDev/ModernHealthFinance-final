import { EntityRepository, Repository } from 'typeorm';
import { Rolesmaster } from '../entities/rolemaster.entity';

@EntityRepository(Rolesmaster)
export class RolesmasterRepository extends Repository<Rolesmaster> {}
