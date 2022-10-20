import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { getManager } from 'typeorm';
import { LogInLogsDto, Logs } from './dto/logs.dto';
import { LogEntity, LogTypeFlags } from '../../entities/log.entity';
import { LogRepository } from '../../repository/log.repository';

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(PaymentScheduleRepository)
    private readonly paymentScheduleRepository: PaymentScheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}

  async getOverview(id) {
    // console.log('getOverview call');

    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from tbluser where delete_flag = 'N' and active_flag = 'Y' and id = $1`,
        [id]
      );
      // console.log('rawData', rawData);

      if (rawData[0]['count'] > 0) {
        let data = {};
        data['user_details'] = await entityManager.query(
          `select t.email c_email,t.city c_city,t.phone c_phone,t.state c_state,t.zipcode c_zipcode,t.*,t3.*, t2.ref_no as user_ref from tblcustomer t join tbluser t2 on t2.id = t.user_id join  tblpractice t3 on t3.id = t."practiceid" where t2.id = $1`,
          [id],
        );
        data['payment_details'] = await this.paymentScheduleRepository.find({
          where: {
            loan_id: data['user_details'][0].loan_id,
            status_flag: 'PAID',
          },
          order: { scheduledate: 'DESC' },
        });
        data['next_schedule'] = await this.paymentScheduleRepository.findOne({
          where: {
            loan_id: data['user_details'][0].loan_id,
            status_flag: 'UNPAID',
          },
          order: { scheduledate: 'ASC' },
        });

        return { statusCode: 200, data: data };
      } else {
        return {
          statusCode: 500,
          message: ['This User Id Not Exists'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async logs(logs: Logs) {
    let log = new LogEntity();
    log.module = logs.module;
    log.user_id = logs.user_id;
    log.loan_id = logs.loan_id;
    log.type = LogTypeFlags[logs.type];

    try {
      await this.logRepository.save(log);
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async addLoginLog(logInLogsDto: LogInLogsDto, ip) {
    try {
      let log = new LogEntity();
      log.module = 'User Logged In from IP:' + ip;
      log.user_id = logInLogsDto.user_id;
      log.type = LogTypeFlags['login'];

      await this.logRepository.save(log);
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
