import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class MakePaymentService {
    
    async projectStatus(id){      
        
        const entityManager = getManager();
        try{
            let data = {}
            data['projectStatus'] = await entityManager.
                query(`select status
                        from tblinstallinginfo t 
                        where loan_id = $1
                        and status = 'projectCompleted'`,
                        [id]);
            return {"statusCode": 200, data:data };
            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
