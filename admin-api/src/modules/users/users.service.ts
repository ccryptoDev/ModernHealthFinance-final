import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SigninCreadentialsDto, VerifyOtpDto } from './dto/signin-user.dto';
import { ForgotPasswordDto } from './dto/forgotpassword-user.dto';
import { PasswordResetDto, CheckTokenDto } from './dto/passwordreset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRepository } from '../../repository/users.repository';
import { OTPRepository } from '../../repository/otp.repository';
import { TokenRepository } from '../../repository/token.repository';
import { OtpEntity } from '../../entities/otp.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import IJwtPayload from '../../payloads/jwt-payload';
import { UserEntity, Flags } from '../../entities/users.entity';

import { getManager, In } from 'typeorm';
import { AddCreadentialsDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { config } from 'dotenv';
import { use } from 'passport';
import { RolesService } from '../roles/roles.service';
import * as crypto from 'crypto';
import { bcryptConfig } from 'src/configs/configs.constants';
import { TokenEntity } from '../../entities/token.entity';

config();

export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  PRACTICEADMIN = 'practice admin',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(OTPRepository)
    private readonly oTPRepository: OTPRepository,
    @InjectRepository(TokenRepository)
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly rolesService: RolesService,
  ) {}

  async signIn(signinCreadentialsDto: SigninCreadentialsDto) {
    const { email, password } = signinCreadentialsDto;
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(
        `select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`,
      );
      console.log(roles);
      if (roles.length > 0) {
        const r = [];
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
        console.log(r);
        const user = await this.userRepository.findOne({
          select: [
            'id',
            'email',
            'firstname',
            'lastname',
            'role',
            'password',
            'twofactorauth',
          ],
          where: {
            delete_flag: 'N',
            email: email,
            role: In(r),
          },
        });
        console.log(user);
        // console.log(await user.validatePassword(password));
        if (user && (await user.validatePassword(password))) {
          const pages = await entityManager.query(
            `select distinct t.order_no ,t.id, t."name" as name from tblpages t join tblrolesmaster t2 on t2.pages_id = t.id where t2.role_id = $1 and t2.delete_flag = 'N' order by t.order_no asc`,
            [user.role],
          );
          if (pages.length > 0) {
            const tabs = {};
            for (let i = 0; i < pages.length; i++) {
              tabs[pages[i]['id']] = await entityManager.query(
                `select distinct t.order_no ,t.id, t."name" as name from tblpagetabs t join tblrolesmaster t2 on t2.pagetabs_id = t.id where t2.pages_id = $1 and t2.role_id = $2 and t2.delete_flag = 'N' order by t.order_no asc`,
                [pages[i]['id'], user.role],
              );
            }
            const resuser = new UserEntity();
            resuser.id = user.id;
            resuser.email = user.email;
            resuser.firstname = user.firstname;
            resuser.lastname = user.lastname;
            resuser.role = user.role;
            resuser.twofactorauth = user.twofactorauth;
            //check two factor auth
            if (user.twofactorauth == 'N') {
              const payload: IJwtPayload = { email, role: UsersRole.ADMIN };
              const jwtAccessToken = await this.jwtService.signAsync(payload);
              return {
                statusCode: 200,
                jwtAccessToken,
                resuser,
                pages: pages,
                tabs: tabs,
              };
            } else {
              //create otp
              let otp = '';
              const length = 6;
              const charset = '123456789';
              for (let i = 0, n = charset.length; i < length; ++i) {
                otp += charset.charAt(Math.floor(Math.random() * n));
              }

              //save otp
              const checkOtp = await this.oTPRepository.findOne({
                user_id: user.id,
              });

              const entityManager = getManager();
              const current_timestamp = await entityManager.query(
                `select current_timestamp`,
              );

              if (checkOtp) {
                await this.oTPRepository.update(
                  { user_id: user.id },
                  {
                    otp: Number(otp),
                    checktime: current_timestamp[0].current_timestamp,
                  },
                );
              } else {
                const newOtp = new OtpEntity();
                newOtp.user_id = user.id;
                newOtp.otp = Number(otp);
                newOtp.checktime = current_timestamp[0].current_timestamp;

                await this.oTPRepository.save(newOtp);
              }

              //send mail
              this.mailService.sendOtp(user.email, otp);

              return { statusCode: 200, resuser, pages: pages, tabs: tabs };
            }
          } else {
            return {
              statusCode: 400,
              message: ['No Page In This User'],
              error: 'Bad Request',
            };
          }
        } else {
          return {
            statusCode: 400,
            message: ['Invalid credentials.'],
            error: 'Bad Request',
          };
        }
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

  async list() {
    const entityManager = getManager();

    try {
      const rawData = await entityManager.query(`select 
        distinct u.ref_no, u.*, r.name as role_name  
        from tbluser u
        left join tblroles r on u.role = r.id
        left join tblrolesmaster t on t.role_id = u.role
        left join tblportal t2 on t.portal_id = t2.id 
        where u.delete_flag = 'N' 
        --and t.delete_flag = 'N'
        --and t2."name" = 'admin'
        order by "createdat" desc`);
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  //edit userdetail//
  async editUserName(id, EditUserDto: EditUserDto) {
    try {
      await this.userRepository.update(
        { id: id },
        {
          firstname: EditUserDto.firstname,
          lastname: EditUserDto.lastname,
        },
      );
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getdetails(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select u.id, u.ref_no, u.email, u."firstname" as firstname, u."lastname" as lastname, r."name" as "role" , u.active_flag, u."emailverify" 
        from tbluser u join tblroles r on u."role" = r.id  
        where u.delete_flag = 'N' and u.id = $1`,
        [id],
      );
      //`select id,ref_no, email, "firstname" as firstname, "lastname" as lastname, role, active_flag, "emailverify" from tbluser where delete_flag = 'N' and id = '${id}'`
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async active(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `UPDATE tbluser SET active_flag='Y'::tbluser_active_flag_enum::tbluser_active_flag_enum WHERE id = $1`,
        [id],
      );
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deactive(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `UPDATE tbluser SET active_flag='N'::tbluser_active_flag_enum::tbluser_active_flag_enum WHERE id = $1`,
        [id],
      );
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async delete(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `UPDATE tbluser SET delete_flag='Y'::tbluser_delete_flag_enum::tbluser_delete_flag_enum WHERE id = $1`,
        [id],
      );
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async add(addCreadentialsDto: AddCreadentialsDto) {
    let url: any = process.env.UI_URL;
    const user = new UserEntity();
    if (
      addCreadentialsDto.email &&
      typeof addCreadentialsDto.email == 'string'
    ) {
      if (addCreadentialsDto.email.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['Email should not be empty'],
          error: 'Bad Request',
        };
      } else {
        user.email = addCreadentialsDto.email;
      }
    } else {
      return {
        statusCode: 400,
        message: ['Email should not be empty'],
        error: 'Bad Request',
      };
    }

    if (addCreadentialsDto.role && typeof addCreadentialsDto.role == 'number') {
      const adminRolesRes = await this.rolesService.getAdminPortalRoles();
      if (!adminRolesRes.data.find(o => o.id == addCreadentialsDto.role)) {
        return {
          statusCode: 400,
          message: ['Selected Role is not in admin portal'],
          error: 'Bad Request',
        };
      }
      user.role = addCreadentialsDto.role;
      url = url + 'admin/login';
    } else {
      return {
        statusCode: 400,
        message: ['Selected Role is not valid'],
        error: 'Bad Request',
      };
    }
    try {
      const users: any = await this.userRepository.find({
        select: ['email'],
        where: { delete_flag: 'N', email: user.email, role: user.role },
      });
      if (users.length > 0) {
        return {
          statusCode: 400,
          message: ['This Email Already Exists'],
          error: 'Bad Request',
        };
      }
      if (
        addCreadentialsDto.firstname &&
        typeof addCreadentialsDto.firstname == 'string'
      ) {
        if (addCreadentialsDto.firstname.trim().length == 0) {
          return {
            statusCode: 400,
            message: ['firstname should not be empty'],
            error: 'Bad Request',
          };
        } else {
          user.firstname = addCreadentialsDto.firstname;
        }
      } else {
        return {
          statusCode: 400,
          message: ['firstname should not be empty'],
          error: 'Bad Request',
        };
      }

      if (
        addCreadentialsDto.lastname &&
        typeof addCreadentialsDto.lastname == 'string'
      ) {
        if (addCreadentialsDto.lastname.trim().length == 0) {
          return {
            statusCode: 400,
            message: ['firstname should not be empty'],
            error: 'Bad Request',
          };
        } else {
          user.lastname = addCreadentialsDto.lastname;
        }
      } else {
        return {
          statusCode: 400,
          message: ['firstname should not be empty'],
          error: 'Bad Request',
        };
      }

      let length = 8,
        charset =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        password = '';
      for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
      }

      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
      user.active_flag = Flags.Y;
      await this.userRepository.save(user);
      this.mailService.add(user.email, password, url);
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async toggleTwoFactorAuth(userId, toggleValue) {
    try {
      console.log('toggleValue------------>', toggleValue);
      await this.userRepository.update(
        { id: userId },
        { twofactorauth: toggleValue.value ? Flags.Y : Flags.N },
      );
      return {
        statusCode: 200,
        message: ['Changed Two factor Authentication Successfully!'],
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getTwoFactorAuth(userId) {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      return { statusCode: 200, data: user };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      const entityManager = getManager();

      const userAuthOtp = await entityManager.query(
        `select current_timestamp, * from tblotp where user_id = $1`,
        [verifyOtpDto.user_id],
      );

      if (userAuthOtp) {
        //check otp expired or not(5 min)
        const d1 = new Date(userAuthOtp[0].current_timestamp);
        const d2 = new Date(userAuthOtp[0].checktime);
        const timeDiffInSec = (d1.getTime() - d2.getTime()) / 1000;

        if (userAuthOtp[0].otp == verifyOtpDto.otp && timeDiffInSec <= 300) {
          const user = await this.userRepository.findOne({
            select: ['email'],
            where: { delete_flag: 'N', id: verifyOtpDto.user_id },
          });
          const payload: IJwtPayload = {
            email: user.email,
            role: UsersRole.ADMIN,
          };
          const jwtAccessToken = await this.jwtService.signAsync(payload);

          return { statusCode: 200, jwtAccessToken };
        } else {
          return {
            statusCode: 101,
            message: ['Invalid or expired OTP. Login again to get new OTP'],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 100,
          message: ['Invalid or expired OTP. Login again to get new OTP'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async forgotPassword(forgotPassword) {
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(
        `select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`,
      );
      console.log('roless------>', roles);
      if (roles.length > 0) {
        const r = [];
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
        const user = await this.userRepository.findOne({
          where: {
            email: forgotPassword.email,
            role: In(r),
            delete_flag: 'N',
          },
        });
        console.log('user----------->', user);
        if (user) {
          const token = await this.tokenRepository.findOne({ id: user.id });
          if (token) {
            await this.tokenRepository.delete({ id: user.id });
          }
          const resetToken = crypto.randomBytes(32).toString('hex');
          const hash = await bcrypt.hash(
            resetToken,
            Number(bcryptConfig.saltRound),
          );
          const tokenEntity = new TokenEntity();
          tokenEntity.id = user.id;
          tokenEntity.token = hash;

          await this.tokenRepository.save(tokenEntity);
          const link = `${process.env.UI_URL}admin/passwordReset?token=${resetToken}&id=${user.id}`;

          this.mailService.passwordResetMail(forgotPassword.email, link);
          return {
            statusCode: 200,
            message: ['Reset password link sent Successfully'],
          };
        } else {
          return {
            statusCode: 100,
            message: ['User does not exist'],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 100,
          message: ['User does not exist'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log('error----------->', error);
      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async passwordReset(passwordResetDto: PasswordResetDto) {
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(
        `select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`,
      );
      if (roles.length > 0) {
        const r = [];
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
        const checkUser = await this.userRepository.findOne({
          where: { id: passwordResetDto.id, role: In(r), delete_flag: 'N' },
        });
        if (checkUser) {
          const salt = await bcrypt.genSalt();
          const hashPassword = await bcrypt.hash(passwordResetDto.newpw, salt);

          await this.userRepository.update(
            { id: passwordResetDto.id },
            { password: hashPassword, salt: salt },
          );
          return {
            statusCode: 200,
            message: ['Password Changed Successfully'],
          };
        } else {
          return {
            statusCode: 100,
            message: ['Invalid user'],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 100,
          message: ['Invalid user'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async changePassword(id, changePasswordDto: ChangePasswordDto) {
    const { currentpw, newpw } = changePasswordDto;
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(
        `select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`,
      );
      if (roles.length > 0) {
        const r = [];
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }

        const user = await this.userRepository.findOne({
          select: ['id', 'email', 'firstname', 'lastname', 'role', 'password'],
          where: { delete_flag: 'N', active_flag: 'Y', id: id, role: In(r) },
        });
        if (user && (await user.validatePassword(currentpw))) {
          const salt = await bcrypt.genSalt();
          const hashPassword = await bcrypt.hash(newpw, salt);

          await this.userRepository.update(
            { id: id },
            { password: hashPassword, salt: salt },
          );
          return {
            statusCode: 200,
            message: ['Password Changed Successfully'],
          };
        } else {
          return { statusCode: 100, message: ['Current Password Is Wrong'] };
        }
      } else {
        return { statusCode: 200, message: ['Password Changed Successfully'] };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async checkToken(checkTokenDto: CheckTokenDto) {
    try {
      const passwordResetToken = await this.tokenRepository.findOne({
        where: { id: checkTokenDto.id },
      });
      if (passwordResetToken) {
        const isValid = await bcrypt.compare(
          checkTokenDto.token,
          passwordResetToken.token,
        );

        if (isValid) {
          return { statusCode: 200, message: ['Token is valid'] };
        } else {
          return {
            statusCode: 101,
            message: ['Invalid or expired password reset token'],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 100,
          message: ['Invalid or expired password reset token'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
