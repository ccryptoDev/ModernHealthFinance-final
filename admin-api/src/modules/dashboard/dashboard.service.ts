import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { Flags, StatusFlags } from '../../entities/loan.entity';
import { getManager } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
  ) {}

  async get(user_id) {
    const entityManager = getManager();
    const data: any = {};
    try {
      let roleid = await entityManager.query(
        `select role from tbluser where id = $1`, [user_id],
      );

      if (roleid[0].role == 1) {
        const rawData = await entityManager.query(`select count (*) as count from tblloan t
  join tblcustomer t3 on t3.user_id = t.user_id 
  join tblpractice t4 on t4.id = t3."practiceid"
  where t.status_flag ='pending'`
          // `select count(*) as count from tblloan t join tbluser t2 on t2.id = t.user_id  where t.delete_flag = 'N' and t.active_flag = 'N' and t.status_flag = 'pending'`,
    //       `select count(*) from tblloan t
    // join tblcustomer t3 on t3.user_id = t.user_id 
    // where t.status_flag ='pending'`
        );
        data.pending_application = rawData[0]['count'];

        const rawData1 = await entityManager.query(
          `select count(*) as count from tblloan t join tbluser t2 on t2.id = t.user_id  where t.delete_flag = 'N' and t.active_flag = 'N' and t.status_flag = 'waiting'`,
        );
        data.incomplete_application = rawData1[0]['count'];

        const rawData2 = await entityManager.query(
          `select count(*) as count from tblloan t join tbluser t2 on t2.id = t.user_id  where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'approvedcontract'`,
        );
        data.approvedcontract_application = rawData2[0]['count'];

        const rawData3 = await entityManager.query(`select count (*) as count from tblloan t join tbluser t2 on t2.id = t.user_id 
                 join tblcustomer t3 on t3.loan_id = t.id
                 join tblpractice t4 on t4.id = t3."practiceid"
                where t.delete_flag = 'N' and t.status_flag = 'canceled'`
          //`select count(*) as count from tblloan t join tbluser t2 on t2.id = t.user_id  where t.delete_flag = 'N' and t.status_flag = 'canceled'`,
        );
        data.canceled_application = rawData3[0]['count'];
        console.log('data.----------------->', data.canceled_application);
        //console.log(rawData[0]['count'])
        //data.incomplete_application = await this.loanRepository.count({where:{delete_flag:Flags.N,active_flag:Flags.N}})
        //   data.approved_application = await this.loanRepository.count({
        //     where: {
        //       delete_flag: Flags.N,
        //       active_flag: Flags.Y,
        //       status_flag: StatusFlags.approved,
        //     },
        //   });
        // data.canceled_application = await this.loanRepository.count({
        //   where: {
        //     delete_flag: Flags.N,
        //     active_flag: Flags.Y,
        //     status_flag: StatusFlags.canceled,
        //   },
        // });
        //   data.waiting_application = await this.loanRepository.count({
        //     where: {
        //       delete_flag: Flags.N,
        //       active_flag: Flags.Y,
        //       status_flag: StatusFlags.waiting,
        //     },
        //   });
        const rawData4 = await entityManager.query(`select count (*) as count
        from tblloan t 
        join tbluser t2 on t2.id = t.user_id 
        join tblcustomer t3 on t3.user_id = t2.id 
        join tblpractice tp on tp.id = t3.practiceid 
        where t.delete_flag = 'N' 
        and t.active_flag = 'Y' 
        --and t.status_flag = 'waiting'`)
        data.all_application = rawData4[0]['count'];
        // data.all_application = await this.loanRepository.count({
        //   where: { delete_flag: Flags.N },
        // });
        return { statusCode: 200, data: data };
      } else if (roleid[0].role == 4) {
        let practiceid = await entityManager.query(
          `select "maininstallerid" from tbluser where id = $1`,
          [user_id],
        );
        console.log(practiceid[0].maininstallerid);
        const rawData = await entityManager.query(
          `select count(*) as count from tblloan t join tblcustomer t2 on t2.loan_id = t.id  where t.delete_flag = 'N' and 
          t.active_flag = 'N' and t.status_flag = 'pending' and t2."practiceid"= $1`,
          [practiceid[0].maininstallerid],
        );
        data.pending_application = rawData[0]['count'];

        const rawData1 = await entityManager.query(
          `select count(*) as count from tblloan t join tblcustomer t2 on t2.loan_id = t.id  where t.delete_flag = 'N'
           and t.active_flag = 'N' and t.status_flag = 'waiting'and t2."practiceid"= $1`,
           [practiceid[0].maininstallerid],
        );
        data.incomplete_application = rawData1[0]['count'];

        const rawData2 = await entityManager.query(
          `select count(*) as count from tblloan t join tblcustomer t2 on t2.loan_id = t.id  where t.delete_flag = 'N' 
          and t.active_flag = 'Y' and t.status_flag = 'approvedcontract' and t2."practiceid"= $1`,
          [practiceid[0].maininstallerid],
        );
        data.approvedcontract_application = rawData2[0]['count'];

        const rawData3 = await entityManager.query(
          `select count(*) as count from tblloan t join tblcustomer t2 on t2.loan_id = t.id  where t.delete_flag = 'N' and 
          t.status_flag = 'canceled' and t2."practiceid"= $1`,
          [practiceid[0].maininstallerid],
        );
        data.canceled_application = rawData3[0]['count'];
        console.log('data.----------------->', data.canceled_application);

        let rawData4 = await entityManager.query(`select count(*) as count from tblloan t join tblcustomer t2 on t2.loan_id = t.id where t.delete_flag = 'N' and 
         t2."practiceid"= $1`, [practiceid[0].maininstallerid]);
        data.all_application = rawData4[0]['count'];
        return { statusCode: 200, data: data };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
