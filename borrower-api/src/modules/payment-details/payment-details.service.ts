import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { getManager } from 'typeorm';


@Injectable()
export class PaymentDetailsService {

    constructor(
        @InjectRepository(PaymentScheduleRepository) private readonly paymentScheduleRepository:PaymentScheduleRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository       
    ){}

    async getPaymentDetails(id){        
        // const entityManager = getManager();
        try{            
            let data = {}
            data['payment_details'] = await this.paymentScheduleRepository.find({where:{loan_id:id, status_flag:'PAID'}, order:{scheduledate: 'DESC'}});
            data['next_schedule'] = await this.paymentScheduleRepository.findOne({where:{loan_id:id, status_flag:'UNPAID'}, order:{scheduledate: 'ASC'}});
            data['user_details'] = await this.customerRepository.findOne({select:['autopayment'],where:{loan_id:id}});
            data['paymentScheduleDetails'] = await this.paymentScheduleRepository.find({where:{loan_id:id}, order:{scheduledate: 'ASC'}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getloandata(id){        
        const entityManager = getManager();
        try{            
            let loandata = {}
            loandata = await entityManager.query(`select t.*,t1.* from tblcustomer t 
            join tblloan t1 on t1.id = t.loan_id
            where t.loan_id= $1`, [id]);
            return {"statusCode": 200, data:loandata };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

}
