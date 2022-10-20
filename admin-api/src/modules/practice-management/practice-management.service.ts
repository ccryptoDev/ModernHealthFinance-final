import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { PracticeRepository } from 'src/repository/practice.repository';
import { PracticeEntity } from 'src/entities/practice.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { FilesEntity } from 'src/entities/files.entity';
import { getManager } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserEntity, Flags } from 'src/entities/users.entity';
import { UserRepository } from 'src/repository/users.repository';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
@Injectable()
export class PracticeManagementService {
  constructor(
    @InjectRepository(PracticeRepository)
    private readonly practiceRepository: PracticeRepository,
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async getPractice(id: string) {
    try {
      const practice: PracticeEntity = (await this.practiceRepository.find({
        where: { id },
      }))[0];
      return {
        statusCode: 200,
        practice
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

  async getPracticeByUrl(url: string) {
    const entityManager = getManager(); //console.log('url => ',url);
    try {
      let practice: any = await entityManager.query(
        `select ref_no, id, "contactname" ,email , "practicename", "practiceurl", "practicehomeurl", "locationname",city ,"statecode" ,"practiceurl" from tblpractice t where t."practiceurl" = $1`,
        [url],
      );
      // await this.practiceRepository.find({
      //   where: { practiceUrl: url },
      // });
      // let practiceLogo = await entityManager.query(
      //   `select filename from tblfiles where link_id = '${practice[0].id}' and delete_flag='N' and services='practiceMangement/practiceLogo'`,
      // );
      // let practicePoweredByLogo = await entityManager.query(
      //   `select originalname,filename from tblfiles where link_id = '${practice[0].id}' and delete_flag='N' and services='practiceMangement/practicePoweredByLogo'`,
      // );
      return {
        statusCode: 200,
        practice: practice[0],
        // practiceLogo,
        // practicePoweredByLogo,
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
  async getallPractice() {
    try {
      let entityManager = getManager();
      let allPractice: any = await entityManager.query(
        `select ref_no, id, "contactname" ,email , "practicename", "practiceurl", "practicehomeurl", "locationname",city ,"statecode" ,"practiceurl" from tblpractice `,
      );
      //let allPractice: any = await this.practiceRepository.find();
      return {
        statusCode: 200,
        allPractice,
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

  async getPracticeName() {
    try {
      let entityManager = getManager();
      let allPractice = await entityManager.query(
        ` select id, "practicename"  from tblpractice t where practicename !='Null' `,
      );
      return {
        statusCode: 200,
        allPractice,
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

  async edit(createPracticeDto: CreatePracticeDto, id: string) {
    try {
      const saveData: Partial<PracticeEntity> = {
        contactname: createPracticeDto.contactName,
        email: createPracticeDto.email,
        practicename: createPracticeDto.practiceName,
        practiceurl: createPracticeDto.practiceUrl,
        practicehomeurl: createPracticeDto.practiceHomeUrl,
        practicelinktoform: createPracticeDto.practiceLinkToForm,
        locationname: createPracticeDto.locationName,
        streetaddress: createPracticeDto.streetaddress,
        city: createPracticeDto.city,
        statecode: createPracticeDto.stateCode,
        zipcode: createPracticeDto.zipcode,
        phonenumber: createPracticeDto.phoneNumber,
        practicesettings: createPracticeDto.practiceSettings,
        practicemaincolor: createPracticeDto.practiceMainColor,
        practicesecondarycolor: createPracticeDto.pacticeSecondaryColor,
        practicelogo: createPracticeDto.practicelogo,
        practicepoweredbylogo: createPracticeDto.practicepoweredbylogo,
      };
      await this.practiceRepository.update({ id }, saveData);
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

  async create(createPracticeDto: CreatePracticeDto) {
    try {
      const email = await this.practiceRepository.find({
        where: { email: createPracticeDto.email },
      });

      const practice = await this.practiceRepository.find({
        where: {
          practiceurl: createPracticeDto.practiceUrl,
        },
      });
      if (email.length == 0 && practice.length == 0) {
        const practiceEntity = new PracticeEntity();
        practiceEntity.contactname = createPracticeDto.contactName;
        practiceEntity.email = createPracticeDto.email;
        practiceEntity.practicename = createPracticeDto.practiceName;
        practiceEntity.practiceurl = createPracticeDto.practiceUrl;
        practiceEntity.practicehomeurl = createPracticeDto.practiceHomeUrl;
        practiceEntity.practicelinktoform =
          createPracticeDto.practiceLinkToForm;
        practiceEntity.locationname = createPracticeDto.locationName;
        practiceEntity.streetaddress = createPracticeDto.streetaddress;
        practiceEntity.city = createPracticeDto.city;
        practiceEntity.statecode = createPracticeDto.stateCode;
        practiceEntity.zipcode = createPracticeDto.zipcode;
        practiceEntity.phonenumber = createPracticeDto.phoneNumber;
        practiceEntity.practicesettings = createPracticeDto.practiceSettings;
        practiceEntity.practicemaincolor = createPracticeDto.practiceMainColor;
        practiceEntity.practicesecondarycolor =
          createPracticeDto.pacticeSecondaryColor;
        practiceEntity.practicelogo = createPracticeDto.practicelogo;
        practiceEntity.practicepoweredbylogo =
          createPracticeDto.practicepoweredbylogo;

        const practice = await this.practiceRepository.save(practiceEntity);

        await this.mailService.createPractice(
          practiceEntity.email,
          `${process.env.UI_URL}${practiceEntity.practiceurl}`,
          practiceEntity.practicename,
        );
        return {
          statusCode: 200,
          message: 'Practice Created Successfully',
          practiceDetails: practice,
        };
      } else {
        return {
          statusCode: 500,
          message: 'Practice Already Exists',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async createPassword() {
    const length = 8,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    return {salt, hashedPass};
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      const practice = await this.practiceRepository.find({
        where: {
          id: createAdminDto.practiceid,
        },
      });

      if (practice.length === 0) {
        return {
          statusCode: 400,
          message: 'Invalid Practice',
        };
      }

      const userEntity = new UserEntity();
      userEntity.maininstallerid = createAdminDto.practiceid;
      userEntity.email = createAdminDto.email.trim();
      userEntity.role = Number(createAdminDto.role);
      userEntity.firstname = createAdminDto.firstname.trim();
      userEntity.lastname = createAdminDto.lastname.trim();
      userEntity.location = createAdminDto.location;
      userEntity.mobile = createAdminDto.mobile;
      userEntity.active_flag = createAdminDto.active ? Flags.Y : Flags.N;

      if (!createAdminDto.id) {
        // Create new Admin password
        const {hashedPass, salt} = await this.createPassword();
        userEntity.password = hashedPass;
        userEntity.salt = salt;
        await this.userRepository.save(userEntity);
        this.mailService.add(
          userEntity.email,
          hashedPass,
          `${process.env.UI_URL}admin/login`,
        );
      } else {
        // Update existing
        await this.userRepository.update(
          { id: createAdminDto.id },
          userEntity,
        );
      }

      return {
        statusCode: 200,
        message: 'Practice Admin Created',
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

  async getAllPracticeAdmin() {
    try {
      let entityManager = getManager();
      let practiceAdmins = await entityManager.query(`select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , t3."name"  as role, t1.active_flag as status, t1."location" as locationname
            from tbluser t1 join tblpractice t2 on t1."maininstallerid" = t2.id join tblroles t3 on t1."role" = t3.id 
            where t1."maininstallerid" is not null`);

      return {
        statusCode: 200,
        data: practiceAdmins,
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
  async geteditpracticeadmin(id: string) {
    try {
      let entityManager = getManager();
      let practiceAdmins = await entityManager.query(`select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , t3."name" as role
from tbluser t1 join tblpractice t2 on t1."maininstallerid" = t2.id join tblroles t3 on t1."role" = t3.id
where t1.id = $1 and t1."maininstallerid" is not null`, [id]);
      // console.log('Edit data => ', practiceAdmins);

      return {
        statusCode: 200,
        data: practiceAdmins,
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

  async getPracticeAdminById(id) {
    try {
      let entityManager = getManager();
      let user = await entityManager.query(`
            select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , 
            t2.id as practiceid, t1.active_flag, t3."name"  as role, t3.id as roleid, t1."location" , t1.mobile 
            from tbluser t1 join tblpractice t2 on t1."mainistallerid" = t2.id join tblroles t3 on t1."role" = t3.id 
            where t1."maininstallerid" is not null and t1.id = $1`,
            [id]);
      if (user.length > 0) {
        return {
          statusCode: 200,
          data: user,
          message: 'Data Updated Successfully',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Invalid Practice Admin',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }
  async editPracticeAdmin(updateAdminDto: UpdateAdminDto, id: string) {
    try {
      let user = await this.userRepository.find({ where: { id: id } });
      if (user.length > 0) {
        let practice = await this.userRepository.update(
          { id: id },
          {
            email: updateAdminDto.email,
            firstname: updateAdminDto.firstname,
            lastname: updateAdminDto.lastname,
            location: updateAdminDto.location,
            mobile: updateAdminDto.mobile,
            active_flag: updateAdminDto.status == 'Y' ? Flags.Y : Flags.N,
          },
        );

        return {
          statusCode: 200,
          message: 'Data Updated Successfully',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Invalid Practice Admin',
        };
      }
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
