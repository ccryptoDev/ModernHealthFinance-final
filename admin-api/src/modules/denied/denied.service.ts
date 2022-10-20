import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class DeniedService {
    async get(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname
            from tblloan t join tbluser t2 on t2.id = t.user_id where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'canceled' order by t."createdat" desc `);
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }

    async getdetails(id){
        const entityManager = getManager();
        try{
            
            const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'canceled' and id = $1`, [id]);
            if(rawData[0]['count']>0){
                const data = {}
                data['answers'] = await entityManager.query("select t.answer as answer, t2.question as question from tblanswer t join tblquestion t2 on t2.id= t.question_id where loan_id = $1", [id])
                data['from_details'] = await entityManager.query("select t.*, t2.ref_no as user_ref from tblcustomer t join tbluser t2  on t2.id = t.user_id where t.loan_id = $1", [id])
                if(data['from_details'][0]['isCoApplicant']){
                    data['CoApplicant'] = await entityManager.query("select * from tblcoapplication where id = $1", [data['from_details'][0]['coapplican_id']])
                }else{
                    data['CoApplicant'] = [];
                }
                data['files'] = await entityManager.query("select originalname,filename from tblfiles where link_id = $1", [id])
                data['paymentScheduleDetails'] = await entityManager.query(`select * from tblpaymentschedule where loan_id = $1 order by "scheduledate" asc`, [id])
                return {"statusCode": 200, data:data };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async setpending(id){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select count(*) as count from tblloan where delete_flag = 'N' and active_flag = 'Y' and (status_flag = 'canceled' or status_flag = 'approved') and id = $1`, [id]);
            if(rawData[0]['count']>0){
            await entityManager.query(`UPDATE tblloan
            SET status_flag='waiting'::tblloan_status_flag_enum::tblloan_status_flag_enum
            WHERE id = $1`, [id]);
            //console.log(rawData)
            return {"statusCode": 200 };
        }else{
            return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
        }
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }

    async setdelete(id){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select count(*) as count from tblloan where (delete_flag = 'N' and active_flag = 'Y' and status_flag = 'canceled') or (delete_flag = 'N' and active_flag = 'N' and status_flag = 'waiting') and `+"id = '"+id+"'");
            if(rawData[0]['count']>0){
            await entityManager.query(`UPDATE tblloan
            SET delete_flag='Y'::tblloan_delete_flag_enum::tblloan_delete_flag_enum
            WHERE id = $1`, [id]);
            //console.log(rawData)
            return {"statusCode": 200 };
        }else{
            return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
        }
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }
}
