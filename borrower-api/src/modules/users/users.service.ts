import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SigninCreadentialsDto, VerifyOtpDto } from './dto/signin-user.dto';
import { UserRepository } from '../../repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import IJwtPayload from '../../payloads/jwt-payload';
import { UserEntity, Flags } from '../../entities/users.entity';
import { EntityManager, getManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenRepository } from 'src/repository/token.repository';
import { bcryptConfig } from 'src/configs/configs.constants';
import { TokenEntity } from 'src/entities/token.entity';
import { MailService } from 'src/mail/mail.service';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
import { OtpRepository } from 'src/repository/otp.repository';
import { OtpEntity } from 'src/entities/otp.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(TokenRepository)
    private readonly tokenRepository: TokenRepository,
    @InjectRepository(OtpRepository)
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signIn(signinCreadentialsDto: SigninCreadentialsDto) {
    const { email, password } = signinCreadentialsDto;
    try {
      let user = await this.userRepository.findOne({
        select: [
          'id',
          'email',
          'firstname',
          'lastname',
          'role',
          'password',
          'active_flag',
          'emailverify',
          'twofactorauth',
        ],
        where: { delete_flag: 'N', email: email, role: 2 },
      });
      if (user && (await user.validatePassword(password))) {
        if (user.active_flag == 'Y') {
          let resuser = new UserEntity();
          resuser.email = user.email;
          resuser.firstname = user.firstname;
          resuser.lastname = user.lastname;
          resuser.role = user.role;
          resuser.id = user.id;
          resuser.twofactorauth = user.twofactorauth;

          //check two factor auth
          if (user.twofactorauth == 'N') {
            const payload: IJwtPayload = { email, role: 'customer' };
            const jwtAccessToken = await this.jwtService.signAsync(payload);

            return { statusCode: 200, jwtAccessToken, resuser };
          } else {
            //create otp
            let otp = '';
            var length = 6;
            var charset = '123456789';
            for (var i = 0, n = charset.length; i < length; ++i) {
              otp += charset.charAt(Math.floor(Math.random() * n));
            }

            //save otp
            let checkOtp = await this.otpRepository.findOne({
              user_id: user.id,
            });

            const entityManager = getManager();
            let current_timestamp = await entityManager.query(
              `select current_timestamp`,
            );

            if (checkOtp) {
              await this.otpRepository.update(
                { user_id: user.id },
                {
                  otp: Number(otp),
                  checktime: current_timestamp[0].current_timestamp,
                },
              );
            } else {
              let newOtp = new OtpEntity();
              newOtp.user_id = user.id;
              newOtp.otp = Number(otp);
              newOtp.checktime = current_timestamp[0].current_timestamp;

              await this.otpRepository.save(newOtp);
            }

            //send mail
            this.mailService.sendOtp(user.email, otp);

            return { statusCode: 200, resuser };
          }
        } else {
          return {
            statusCode: 400,
            message: ['Your Account Is Not Activated.'],
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
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async changePassword(id, changePasswordDto: ChangePasswordDto) {
    const { currentpw, newpw } = changePasswordDto;
    try {
      let user = await this.userRepository.findOne({
        select: ['id', 'email', 'firstname', 'lastname', 'role', 'password'],
        where: { delete_flag: 'N', active_flag: 'Y', id: id, role: 2 },
      });
      if (user && (await user.validatePassword(currentpw))) {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(newpw, salt);

        await this.userRepository.update(
          { id: id },
          { password: hashPassword, salt: salt },
        );
        return { statusCode: 200, message: ['Password Changed Successfully'] };
      } else {
        return { statusCode: 100, message: ['Current Password Is Wrong'] };
      }
    } catch (error) {
      console.log(error);

      return {
        statusCode: 400,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async verify(id, token) {
    const entityManager = getManager();
    try {
      let verifyToken = await this.tokenRepository.findOne({
        where: { id: id },
      });
      if (verifyToken) {
        const isValid = await bcrypt.compare(token, verifyToken.token);
        if (isValid) {
          await entityManager.query(
            `UPDATE tbluser
            SET "emailverify"='Y'::tbluser_emailverify_enum::tbluser_emailverify_enum
            WHERE id = $1`,
            [id],
          );

          return { statusCode: 200, message: ['User Verfied Successfully'] };
        } else {
          return {
            statusCode: 101,
            message: ['Invalid or expired url'],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 100,
          message: ['Invalid or expired url'],
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      let user = await this.userRepository.findOne({
        where: { email: forgotPasswordDto.email, role: 2, delete_flag: 'N' },
      });
      if (user) {
        let token = await this.tokenRepository.findOne({ id: user.id });
        if (token) {
          await this.tokenRepository.delete({ id: user.id });
        }

        let resetToken = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(
          resetToken,
          Number(bcryptConfig.saltRound),
        );

        let tokenEntity = new TokenEntity();
        tokenEntity.id = user.id;
        tokenEntity.token = hash;

        await this.tokenRepository.save(tokenEntity);
        
        const link = `${process.env.BorrowerUrl}borrower/passwordReset?token=${resetToken}&id=${user.id}`;
        this.mailService.passwordResetMail(forgotPasswordDto.email, link);
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
      let passwordResetToken = await this.tokenRepository.findOne({
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

  async passwordReset(passwordResetDto: PasswordResetDto) {
    console.log('hi');
    try {
      let passwordResetToken = await this.tokenRepository.findOne({
        where: { id: passwordResetDto.id },
      });
      console.log('passwordResetToken-->', passwordResetToken);
      if (passwordResetToken) {
        const isValid = await bcrypt.compare(
          passwordResetDto.token,
          passwordResetToken.token,
        );

        if (isValid) {
          const entityManager = getManager();
          let checkUser = await this.userRepository.findOne({
            where: { id: passwordResetDto.id, role: '2', delete_flag: 'N' },
          });
          if (checkUser) {
            await entityManager.query(
              `DELETE FROM tbltoken WHERE id = $1`,
              [passwordResetDto.id],
            );

            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(
              passwordResetDto.newpw,
              salt,
            );

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

  async toggleTwoFactorAuth(userId, toggleValue) {
    try {
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
      let user = await this.userRepository.findOne({ id: userId });
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

      let userAuthOtp = await entityManager.query(
        `select current_timestamp, * from tblotp where user_id = $1`,
        [verifyOtpDto.user_id],
      );

      if (userAuthOtp) {
        //check otp expired or not(5 min)
        let d1 = new Date(userAuthOtp[0].current_timestamp);
        let d2 = new Date(userAuthOtp[0].checktime);
        let timeDiffInSec = (d1.getTime() - d2.getTime()) / 1000;

        //if ((userAuthOtp[0].otp==verifyOtpDto.otp) && (timeDiffInSec<=300)) {
        if (userAuthOtp[0].otp == verifyOtpDto.otp) {
          await entityManager.query(
            `DELETE FROM tblotp WHERE user_id = $1`,
            [userAuthOtp[0].user_id],
          );
          let user = await this.userRepository.findOne({
            select: ['email'],
            where: { delete_flag: 'N', id: verifyOtpDto.user_id },
          });
          const payload: IJwtPayload = { email: user.email, role: 'customer' };
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
}
