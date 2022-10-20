import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { UploadfilesService } from '../uploadfiles/uploadfiles.service';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { UserRepository } from 'src/repository/users.repository';
@Injectable()
export class IncompleteService {
  constructor(
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid() private readonly client: SendGridService,
  ) {}
  async get() {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(`select 
      t.id as loanid,
      t.user_id as user_id,
      t2.ref_no as user_ref,
      t2."firstname" as firstname,
      t2.email as email,
      t3.phone as phno, 
      t.status_flag as regstatus,
      tp."practicename"  as practicename,
      to_char(t."createdat",'yyyy-mm-dd') as createddate
      from tblloan t 
      join tbluser t2 on t2.id = t.user_id 
      join tblcustomer t3 on t3.user_id = t2.id 
      join tblpractice tp on tp.id = t3.practiceid 
      where t.delete_flag = 'N' 
      and t.active_flag = 'Y' 
      --and t.status_flag = 'waiting'
      order by t."createdat" desc`);
      console.log('incomplete phone number', rawData);
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getAll() {
    console.log('Hello');
    try {
      const entityManager = getManager();
      let customerDetails = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname
      from tblloan t join tbluser t2 on t2.id = t.user_id where t.delete_flag = 'N' order by t."createdat" desc`);
      return { statusCode: 200, data: customerDetails };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getdetails(id) {
    const entityManager = getManager();
    const viewDocument = new UploadfilesService(
      this.uploadUserDocumentRepository,
      this.loanRepository,
      this.paymentscheduleRepository,
      this.logRepository,
      this.userRepository,
      this.client,
    );
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'N' and status_flag = 'waiting' and id = $1`,
        [id],
      );
      if (rawData[0]['count'] > 0) {
        const data = {};
        // data['answers'] = await entityManager.query(
        //   "select t.answer as answer, t2.question as question from tblanswer t join tblquestion t2 on t2.id= t.question_id where loan_id = '" +
        //     id +
        //     "'",
        // );

        //data['answers'] = [];
        data['from_details'] = await entityManager.query(
          "select t.*, t2.ref_no as user_ref from tblcustomer t join tbluser t2  on t2.id = t.user_id where t.loan_id = $1", [id],
        );
        // if (data['from_details'][0]['isCoApplicant']) {
        //   data['CoApplicant'] = await entityManager.query(
        //     "select * from tblcoapplication where id = '" +
        //       data['from_details'][0]['coapplican_id'] +
        //       "'",
        //   );
        // } else {
        //   data['CoApplicant'] = [];
        // }
        // data['files'] = await entityManager.query(
        //   "select originalname,filename from tblfiles where link_id = '" +
        //     id +
        //     "'",
        // );
        // data['paymentScheduleDetails'] = await entityManager.query(
        //   `select * from tblpaymentschedule where loan_id = '${id}'  order by "scheduledate" asc`,
        // );
        data['document'] = await (await viewDocument.getDocument(id)).data;
        data['userDocument'] = await (await viewDocument.getUserDocument(id))
          .data;
        return { statusCode: 200, data: data };
      } else {
        return {
          statusCode: 500,
          message: ['This Loan Id Not Exists'],
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
}
