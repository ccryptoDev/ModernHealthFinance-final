import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager, getManager } from 'typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { commonService } from '../../common/helper-service';
import { LogRepository } from '../../repository/log.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { UploadfilesService } from '../uploadfiles/uploadfiles.service';
import {
  UpdateUserLoanAmount,
  createPaymentSchedulerDto,
  manualBankAddDto,
  UpdatePendingapplicationDto,
  UpdateEmployInfo,
} from '../loanstage/dto/update-loanstage.dto';
import { CustomerRepository } from '../../repository/customer.repository';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { PaymentcalculationService } from '../../paymentcalculation/paymentcalculation.service';
import { UserRepository } from 'src/repository/users.repository';
import { LogEntity } from 'src/entities/log.entity';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserBankAccount } from '../../entities/userBankAccount.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Flags, StatusFlags } from 'src/entities/loan.entity';
import { MailService } from '../../mail/mail.service';
import { consoleTestResultHandler } from 'tslint/lib/test';
@Injectable()
export class LoanstageService {
  constructor(
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(UserBankAccountRepository)
    private readonly userBankAccountRepository: UserBankAccountRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid() private readonly client: SendGridService,
    private readonly mailService: MailService,
  ) {}
  async getAllCustomerDetails(stage, user_id) {
    const entityManager = getManager();
    try {
      let customerDetails = '';
      let reqData = await entityManager.query(
        `select role, "maininstallerid" from tbluser where id = $1`,
        [user_id],
      );
      if (reqData[0].role == 1) {
        if (stage == 'waiting' || stage == 'pending') {
      //     customerDetails = await entityManager.query(
      //       `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",
      //       t3."apr" as "apr", t3."practiceid" as "practiceid", 
      //     t3.phone as phone,t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, 
      //     t2."lastname" as lastname,t."updatedat" as "updatedat" , t."createdat" as "createdat" from tblloan t join tbluser t2 on t2.id = t.user_id 
      //  join tblcustomer t3 on t3.loan_id = t.id
      //  --join tblpractice t4 on t4.id = t3."practiceid"
      // where t.delete_flag = 'N' and t.active_flag = 'N' and t.status_flag = '${stage}' 
      // order by t."createdat" desc `,
      
      customerDetails = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",
      t3."apr" as "apr", t3."practiceid" as "practiceid", t3.phone as phone,t3.email as email, t3.ref_no as user_ref, t3."firstname" as firstname, 
    t3."lastname" as lastname, t4."practicename" as "practiceName", t."updatedat" as "updatedat" , t."createdat" as "createdat" from tblloan t
join tblcustomer t3 on t3.user_id = t.user_id 
join tblpractice t4 on t4.id = t3."practiceid"
where t.status_flag = $1 order by t."createdat" desc`, [stage]);

        } else if (stage == 'archived') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr", t3."practiceid" as "practiceid",t3.phone as phone,
           t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname, t4."practicename" as "practiceName",t."updatedat" as "updatedat" , t."createdat" as "createdat" from tblloan t join tbluser t2 on t2.id = t.user_id 
       join tblcustomer t3 on t3.loan_id = t.id
       join tblpractice t4 on t4.id = t3."practiceid"
      where t.status_flag = 'archive' 
      order by t."createdat" desc `,
          );
        } else if (stage == 'approved') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N'  and t.active_flag = 'Y' and t.status_flag = 'approvedcontract' 
        order by t."createdat" desc`,
          );
        } else if (stage == 'denied') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N' and t.status_flag = 'canceled' 
        order by t."createdat" desc`,
          );
        } else {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N' and t.status_flag = $1
        order by t."createdat" desc`,
        [stage],
          );
        }
         return { statusCode: 200, data: customerDetails };
      } else if (reqData[0].role == 4) {
        if (stage == 'waiting' || stage == 'pending') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr", t3."practiceid" as "practiceid", 
          t3.phone as phone,t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname, t4."practicename" as "practiceName",t."updatedat" as "updatedat" , t."createdat" as "createdat" from tblloan t join tbluser t2 on t2.id = t.user_id 
       join tblcustomer t3 on t3.loan_id = t.id
       join tblpractice t4 on t4.id = t3."practiceid"
      where t.delete_flag = 'N' and t.active_flag = 'N' and t.status_flag = $1
      and t3."practiceid" = $2
      order by t."createdat" desc `,
      [stage, reqData[0].maininstallerid],
          );
        } else if (stage == 'archived') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr", t3."practiceid" as "practiceid",t3.phone as phone,
           t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname, t4."practicename" as "practiceName",t."updatedat" as "updatedat" , t."createdat" as "createdat" from tblloan t join tbluser t2 on t2.id = t.user_id 
       join tblcustomer t3 on t3.loan_id = t.id
       join tblpractice t4 on t4.id = t3."practiceid"
      where t.status_flag = 'archive' 
            and t3."practiceid" = $1
      order by t."createdat" desc `,
      [reqData[0].maininstallerid],
          );
        } else if (stage == 'approved') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N'  and t.active_flag = 'Y' and t.status_flag = 'approvedcontract' 
              and t3."practiceid" = $1

        order by t."createdat" desc`,
        [reqData[0].maininstallerid],
          );
        } else if (stage == 'denied') {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N' and t.status_flag = 'canceled'
              and t3."practiceid" = $1
        order by t."createdat" desc`,
        [reqData[0].maininstallerid],
          );
        } else {
          customerDetails = await entityManager.query(
            `select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t3."loanamount" as "loanamount",t3."apr" as "apr",
t3."practiceid" as "practiceid", t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname,
t2."lastname" as lastname, t4."practicename" as "practiceName",t3.phone as phone,
        t."createdat" as "createdat",t."updatedat" as "updatedat" from tblloan t join tbluser t2 on t2.id = t.user_id 
         join tblcustomer t3 on t3.loan_id = t.id
         join tblpractice t4 on t4.id = t3."practiceid"
        where t.delete_flag = 'N' and t.status_flag = $1
                      and t3."practiceid" = $2
        order by t."createdat" desc`,
        [stage, reqData[0].maininstallerid],
          );
        }
        return { statusCode: 200, data: customerDetails };
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
  //Get A Particular Customer Details
  async getACustomerDetails(id, stage) {
    const viewDocument = new UploadfilesService(
      this.uploadUserDocumentRepository,
      this.loanRepository,
      this.paymentscheduleRepository,
      this.logRepository,
      this.userRepository,
      this.client,
    );
    const entityManager = getManager();
    try {
      let rawData = '';
      if (stage == 'waiting' || stage == 'pending') {
        rawData = await entityManager.query(
          `select count(*) as count from tblloan where delete_flag = 'N' and (active_flag = 'N' or active_flag = 'Y') and status_flag = $1 and ` +
            "id = $2",
            [stage, id],
        );
      } else if (stage == 'archived') {
        rawData = await entityManager.query(
          `select count(*) as count from tblloan where status_flag='archive' and id = $1`,
          [id],
        );
      } else if (stage == 'approved') {
        rawData = await entityManager.query(
          `select count(*) as count from tblloan where delete_flag = 'N' and status_flag = 'approvedcontract' and ` +
            "id = $1",
            [id],
        );
      } else if (stage == 'denied') {
        rawData = await entityManager.query(
          `select count(*) as count from tblloan where delete_flag = 'N' and status_flag = 'canceled' and id = $1`,
          [id],
        );
      } else {
        rawData = await entityManager.query(
          `select count(*) as count from tblloan where delete_flag = 'N' and status_flag = $1 and id = $2`,
            [stage, id],
        );
      }
      if (rawData[0]['count'] > 0) {
        const data = {};
        //data['answers'] = await entityManager.query("select t.answer as answer, t2.question as question from tblanswer t join tblquestion t2 on t2.id= t.question_id where loan_id = '"+id+"'")
        data['from_details'] = await entityManager.query("select t.*, t2.ref_no as user_ref, t3.practicename from tblcustomer t join tbluser t2  on t2.id = t.user_id join tblpractice t3 on t3.id = t.practiceid where t.loan_id = $1",
        [id]);
        data['stage'] = await entityManager.query(
          `SELECT status_flag FROM tblloan where id = $1`, [id],
        );
        if (data['from_details'][0]['isCoApplicant']) {
          data['CoApplicant'] = await entityManager.query(
            "select * from tblcoapplication where id = $1",
            [data['from_details'][0]['coapplican_id']],
          );
        } else {
          data['CoApplicant'] = [];
        }
        data['files'] = await entityManager.query(
          "select originalname,filename from tblfiles where link_id = $1",
          [id],
        );
        data['paymentScheduleDetails'] = await entityManager.query(
          `select * from tblpaymentschedule where loan_id = $1 and delete_flag = 'N' order by "scheduledate" asc`,
          [id],
        );
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
  async getALogs(id) {
    const entityManager = getManager();
    try {
      const logData = await entityManager.query(
        `select CONCAT ('LOG_',t.id) as id, t.module as module, concat(t2.email,' - ',INITCAP(t2."role"::text)) as user, t."createdat" as createdat from tbllog t join tbluser t2 on t2.id = t.user_id  where t.loan_id = $1 order by t."createdat" desc;`,
        [id],
      );
      //console.log(rawData)
      return { statusCode: 200, data: logData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async movedToNextStage(id, nextStage) {
    try {
      await this.loanRepository.update(
        { id: id },
        { status_flag: nextStage.stage },
      );
      return { statusCode: 200, data: 'Loan Details Updated succesfully ' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async editCustomerLoanAmountDetails(
    id,
    updateUserLoanAmount: UpdateUserLoanAmount,
  ) {
    const entityManager = getManager();
    try {
      let paymentDetails = await entityManager.query(
        `SELECT * FROM tblpaymentschedule where loan_id = $1 order by "scheduledate" ASC`,
        [id],
      );
      let currentDate = new Date();
      if (paymentDetails[0].scheduledate < currentDate) {
        return {
          statusCode: 400,
          message: 'Frist payment schedule is started.So you can,t Reschedule',
          error: 'Bad Request',
        };
      }
      const ps = new PaymentcalculationService();
      const getRealAPR = ps.findPaymentAmountWithOrigination(
        updateUserLoanAmount.loanamount,
        updateUserLoanAmount.apr,
        updateUserLoanAmount.duration,
        updateUserLoanAmount.orginationFee,
      );
      await this.customerRepository.update(
        { loan_id: id },
        {
          loanamount: updateUserLoanAmount.loanamount,
          apr: updateUserLoanAmount.apr,
          loanterm: updateUserLoanAmount.duration,
          orginationfees: updateUserLoanAmount.orginationFee,
          newapr: getRealAPR.realAPR,
        },
      );
      let paymentFrequency = await entityManager.query(
        `SELECT "payfrequency" FROM tblcustomer where loan_id = $1`,
        [id],
      );
      let PaymentReschedule = {};
      PaymentReschedule['loan_id'] = id;
      PaymentReschedule['paymentFrequency'] = paymentFrequency[0].payfrequency;
      PaymentReschedule['date'] = paymentDetails[0].scheduledate;
      await this.paymentRescheduler(PaymentReschedule);
      return { statusCode: 200, data: 'Update user loan details successfully' };
    } catch (error) {
      console.log('error---------->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async paymentRescheduler(createPaymentSchedulerDto) {
    const entityManager = getManager();
    try {
      const customerData = await entityManager.query(
        `select * from tblcustomer where loan_id = $1`,
        [createPaymentSchedulerDto.loan_id],
      );
      const getLoanStatus = await entityManager.query(
        `select "status_flag" from tblloan where id = $1`,
        [createPaymentSchedulerDto.loan_id],
      );
      if (
        getLoanStatus[0].status_flag == 'performingcontract' ||
        getLoanStatus[0].status_flag == 'approved'
      ) {
        return {
          statusCode: 400,
          message: 'you cant"t do payment reschedule at this satge',
          error: 'Bad Request',
        };
      }
      const futureDate = new Date(createPaymentSchedulerDto.date);
      const currentDate = new Date();

      let dueDate =  customerData[0].payment_duedate;
      let dates1 = futureDate.setDate(futureDate.getDate() + parseInt(dueDate));
      let newDate =  new Date(dates1).toISOString();
      
      if (currentDate > futureDate) {
        return {
          statusCode: 400,
          message: 'your date should be greater than today date',
          error: 'Bad Request',
        };
      }
      const pc = new PaymentcalculationService();
      const getPaymentReschedulerData = pc.createPaymentReScheduler(
        customerData[0].loanamount,
        customerData[0].apr,
        customerData[0].loanterm,
        newDate,
        //futureDate,
        createPaymentSchedulerDto.paymentFrequency,
        createPaymentSchedulerDto.loan_id,
      );
      const getPaymentScheduleData = await this.paymentscheduleRepository.find({
        loan_id: createPaymentSchedulerDto.loan_id,
      });
      if (getPaymentScheduleData.length > 1) {
        const paymentScheduleArray = [];
        for (let i = 0; i < getPaymentReschedulerData.length; i++) {
          const paymentSchedule = new PaymentscheduleEntity();
          paymentSchedule.loan_id = createPaymentSchedulerDto.loan_id;
          paymentSchedule.unpaidprincipal = getPaymentReschedulerData[i].unpaidprincipal;
          paymentSchedule.principal = getPaymentReschedulerData[i].principal;
          paymentSchedule.interest = getPaymentReschedulerData[i].interest;
          paymentSchedule.fees = getPaymentReschedulerData[i].fees;
          paymentSchedule.amount = getPaymentReschedulerData[i].amount;
          paymentSchedule.scheduledate = getPaymentReschedulerData[i].scheduledate;
          paymentScheduleArray.push(paymentSchedule);
        }
        await this.paymentscheduleRepository.delete({
          loan_id: createPaymentSchedulerDto.loan_id,
        });
        console.log('paymentScheduleArray => ',paymentScheduleArray);
        await this.paymentscheduleRepository.save(paymentScheduleArray);
        await this.customerRepository.update(
          { loan_id: createPaymentSchedulerDto.loan_id },
          {
            payfrequency: createPaymentSchedulerDto.paymentFrequency,
          },
        );
      }
      return {
        statusCode: 200,
        data: 'Payment Rescheduler Data updated Successfully',
      };
    } catch (error) {
      console.log('error---->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async manualBankAdd(manualBankAddDto: manualBankAddDto) {
    try {
      const userBankAccount = new UserBankAccount();
      userBankAccount.bankname = manualBankAddDto.bankname;
      userBankAccount.holdername = manualBankAddDto.holdername;
      userBankAccount.routingnumber = manualBankAddDto.routingnumber;
      userBankAccount.accountnumber = manualBankAddDto.accountnumber;
      userBankAccount.user_id = manualBankAddDto.user_id;

      await this.userBankAccountRepository.save(userBankAccount);
      return {
        statusCode: 200,
        data: 'User Bank account details  will be added successfully',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getDocument(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      const rawdata = await entityManager.query(
        `select u."filepath", c."name" ,c."filename" from "tbluserconsent" u,"tblconsentmaster" c
        where c."filekey" = u."filekey" and u."loanid" = $1`,
        [id],
      );
      data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getUserDocument(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      const rawdata = await entityManager.query(
        `select "orginalfilename","filename","type" from tbluseruploaddocument where loan_id = $1`,
        [id],
      );
      data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async updatePendingApp(
    loan_id,
    updatePendingAppDto: UpdatePendingapplicationDto,
  ) {
    try {
      let entityManager = getManager();
      
      let data = await entityManager.query(
        `select user_id, id from tblloan where id = $1`,
        [loan_id],
      );
      
      if (data.length > 0) {
        await this.customerRepository.update(
          { loan_id: loan_id },
          {
            procedure_startdate: updatePendingAppDto.procedure_startdate,
            payment_duedate: updatePendingAppDto.payment_duedate,
          },
        );
        //payment rescheduler
        let paymentFrequency = await entityManager.query(
          `SELECT "payfrequency" FROM tblcustomer where loan_id = $1`,
          [loan_id],
        );
        let paymentcreateddate = await entityManager.query(
          `SELECT "createdat" from tblloan where id = $1`,
          [loan_id],
        );
        let PaymentReschedule = {};
        PaymentReschedule['loan_id'] = loan_id;
        PaymentReschedule['paymentFrequency'] = paymentFrequency[0].payfrequency;
        //PaymentReschedule['date'] = updatePendingAppDto.procedure_startdate;//paymentDetails[0].scheduledate;
        PaymentReschedule['date'] = paymentcreateddate[0].createdat;//paymentDetails[0].scheduledate;
        
        await this.paymentRescheduler(PaymentReschedule);
        
        await this.loanRepository.update(
          { id: loan_id },
          { status_flag: StatusFlags.approvedcontract,
            active_flag: Flags.Y,
          },
        );
        this.mailService.mail1(loan_id, 'Welcome');

        return {
          statusCode: 200,
          message: [
            'Application stage successfully moved from pending to Approved Contract',
          ],
        };
      } else {
        return {
          statusCode: 400,
          message: ['Loan Id not exist'],
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

  async makeArchive(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select status_flag from tblloan where id = $1`,
        [loan_id],
      );
      let previous_stage = data[0].status_flag;
      if (data.length > 0) {
        await entityManager.query(
          `UPDATE tblloan
                SET status_flag='archive'::tblloan_status_flag_enum::tblloan_status_flag_enum
                WHERE id = $1`,
            [loan_id],
        );
        return {
          statusCode: 200,
          message: ['Loan Application Archived Successfully!!'],
          prev_stage: previous_stage,
        };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan Id'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
      };
    }
  }

  async setdenied(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select status_flag from tblloan where id = $1`,
        [loan_id],
      );
      let previous_stage = data[0].status_flag;
      if (data.length > 0) {
        await entityManager.query(
          `UPDATE tblloan
                SET status_flag='canceled'::tblloan_status_flag_enum::tblloan_status_flag_enum
                WHERE ` +
            "id = $1", 
            [loan_id],
        );
        return {
          statusCode: 200,
          message: ['Loan Application denied Successfully!!'],
          prev_stage: previous_stage,
        };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan Id'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
      };
    }
  }

  async getProcedureStartDate(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select "procedure_startdate", "loanamount" from tblcustomer where loan_id = $1`,
        [loan_id],
      );
      console.log('data');

      return { statusCode: 200, message: ['success'], data: data };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: ['Bad Request'],
      };
    }
  }

  async updateProcedureDate(
    loan_id,
    updatePendingAppDto: UpdatePendingapplicationDto,
  ) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select count(*) from tblloan where status_flag ='approvedcontract' and id = $1`,
        [loan_id],
      );
      if (data[0].count > 0) {
        await this.customerRepository.update(
          { loan_id: loan_id },
          {
            procedure_startdate: updatePendingAppDto.procedure_startdate,
          },
        );
        return { statusCode: 200, message: ['success'] };
      } else {
        return {
          statusCode: 400,
          message: ['Loan Id not Exist!'],
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

  async setFundingContract(loan_id) {
    try {
      let entityManager = getManager();

      let data = await entityManager.query(
        `select count(*) from tblloan where status_flag = 'approvedcontract' and id = $1`,
        [loan_id],
      );
      console.log(data);
      if (data[0].count > 0) {
        await this.loanRepository.update(
          { id: loan_id },
          {
            status_flag: StatusFlags.fundingcontract,
          },
        );
        return { statusCode: 200, message: ['success'] };
      } else {
        return { statusCode: 400, message: ['Loan Id not exist!'] };
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

  async updateemploydetails(id,updateEmployInfo: UpdateEmployInfo) {
    try {
      let updData:any= {};
      if(updateEmployInfo.employer) {
        updData.employer =updateEmployInfo.employer;
      }
      if(updateEmployInfo.employerphone) {
        updData.employerphone =updateEmployInfo.employerphone;
      }
      if(updateEmployInfo.streetaddress) {
        updData.streetaddress =updateEmployInfo.streetaddress;
      }
      if(updateEmployInfo.city) {
        updData.city =updateEmployInfo.city;
      }
      if(updateEmployInfo.state) {
        updData.state =updateEmployInfo.state;
      }
      if(updateEmployInfo.zipcode) {
        updData.zipcode =updateEmployInfo.zipcode;
      }
      if(updateEmployInfo.annualincome) {
        updData.annualincome =updateEmployInfo.annualincome;
      }
      if(updateEmployInfo.payment_duedate) {
        updData.payment_duedate =updateEmployInfo.payment_duedate;
      }
      await this.customerRepository.update({ loan_id: id }, updData);
      let entityManager = getManager();
      let data = await entityManager.query(
        `select payment_duedate,payfrequency from tblcustomer where loan_id = $1`,
        [id],
      );
      if(data[0].payment_duedate != updateEmployInfo.payment_duedate){
        let PaymentReschedule = {};
        PaymentReschedule['loan_id'] = id;
        PaymentReschedule['paymentFrequency'] = data[0].payfrequency;
        PaymentReschedule['date'] = updateEmployInfo.createdat;
        console.log('payment')
        await this.paymentRescheduler(PaymentReschedule);
        console.log('reschedule')
      }

      return {
        statusCode: 200,
        message: 'Data Updated Successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

}
