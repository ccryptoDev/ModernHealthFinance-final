import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import {LoanRepository} from '../../repository/loan.repository';
import { getManager } from 'typeorm';

export enum Flags {
  Y = 'Y'
}

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
  ){

  }

  async getDocuments(id){
    const entityManager = getManager();
    try{
      let data = {}        
      data['files'] = await entityManager.query(`select originalname,filename, "documenttype" from tblfiles where link_id = $1 and delete_flag='N'`,
      [id]);
      data["userConsentDoc"] = await entityManager.query(`select ucon.id,ucon."loanid",ucon."filepath",ucon."filekey",conm.name from tbluserconsent ucon join tblconsentmaster conm on conm."filekey" = ucon."filekey"
                where "loanid" = $1`, [id])
      data["userUploadedDoc"] = await entityManager.query(`select t.filename,t.orginalfilename,t."type" from tbluseruploaddocument t where t.loan_id = $1`,
      [id]);
      data['initialnote'] = await entityManager.query(`select 
      t."createdat" as createdat,
      t.ref_no as ref_no, 
      t2."firstname" as firstname,
      t2."lastname" as lastname,
      t2."streetaddress" ,t2.unit ,t2.city ,t2.state,t2."zipcode"
      from tblloan t join tblcustomer t2 on t2.user_id=t.user_id where t.id = $1`,
      [id]);
      return { "statusCode": 200, "data": data}
    }catch(error){
      console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async save(files,createUploadDto: CreateUploadDto) {    
    let filedata = [];
    for (let i = 0; i < files.length; i++) {      
      let file:FilesEntity = new FilesEntity();
      file.originalname = files[i].originalname;
      file.filename = files[i].filename;
      file.services = 'borrower/upload';
      file.documenttype = createUploadDto.documentTypes[i];
      file.link_id = createUploadDto.loan_id;
      filedata.push(file)
    }
    try{
      await this.filesRepository.save(filedata);
      await this.loanRepository.update({id: createUploadDto.loan_id}, { active_flag: Flags.Y });
      return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}

    } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }
}
