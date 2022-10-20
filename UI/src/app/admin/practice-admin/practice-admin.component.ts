import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/_service/http.service';
import { readyMade } from 'src/environments/environment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-practice-admin',
  templateUrl: './practice-admin.component.html',
  styleUrls: ['./practice-admin.component.scss'],
})
export class PracticeAdminComponent implements OnInit {
  isListView: Boolean = true;
  data: any = [];
  apForm: FormGroup;
  apibtn: boolean = false;
  dtOptions: any = {};
  practiceList: any = [];
  roleList: any[] = [];
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      scrollX: true,
    };

    this.get();
    this.apForm = this.formBuilder.group({
      id: [''],
      practiceName: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.email)],
      ],
      role: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      locationname: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
    this.getPracticeName();
    this.getRoles();
  }

  get apiFormvalidation() {
    return this.apForm.controls;
  }

  getPracticeName() {
    this.service
      .authget('practice', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.practiceList = res['allPractice'];
          } else {
            this.service.showError('Invaild page');
          }
        },
        (err) => {
          console.log(err);
          this.service.showError('Invaild page');
        }
      );
  }

  getRoles() {
    this.service
      .authget('roles/getRoles', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200 && res['data']) {
            // TODO: find a way to exclude customer server-side
            const data = res['data'].filter(({name}) => name !== 'customer');
            // Capitalize the first letter of displayed role name to make form prettier
            data.forEach((role) => role.displayName = role.name.charAt(0).toUpperCase() + role.name.slice(1));
            this.roleList = data;
          } else {
            this.service.showError('Could not fetch list of administrator roles');
          }
        },
        (err) => {
          console.log(err);
          this.service.showError('Invaild page');
        }
      );
  }

  get() {
    this.service
      .authget('practice/all-admins', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
          } else {
            this.service.showError('Invaild page');
          }
        },
        (err) => {
          console.log(err);
          this.service.showError('Invaild page');
        }
      );
  }

  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      const data = this.apForm.value;
      const role = this.roleList.find((role) => role.name === data.role).id;
      const sendData = {
        practiceid: data.practiceName,
        email: data.email,
        role,
        firstname: data.firstname,
        lastname: data.lastname,
        location: data.locationname,
        mobile: data.mobileNumber,
        active: data.status === 'Y',
        id: data.id ? data.id : undefined,
      };
      this.service
        .authpost('practice/create-admin', 'admin', sendData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.isListView = !this.isListView;
              this.apibtn = false;
              this.service.showSuccess('Successfully Saved');
              this.get();
            } else {
              this.service.showError('Not Saved');
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  editPracticeData(data: any) {
    // if (id) {
    //   this.service
    //     .authget(`practice/${id}`, 'admin')
    //     .pipe(first())
    //     .subscribe(
    //       (res) => {
    //         if (res['statusCode'] == 200) {
    //           this.isListView = !this.isListView;
    //           let resPonseData = res['practice'];
    //           console.log('getdatabyid', res);
    //           // this.preFileitems = resPonseData.files[0];
    //           // this.preFileitemsTwo = resPonseData.files[1];
    //           //console.log('/////',resPonseData)
    //           //console.log('*****',this.preFileitemsTwo.originalname)
    //           if (resPonseData && Object.keys(resPonseData).length > 0) {
    //             // this.mainColor = resPonseData.practiceMainColor;
    //             // this.secondaryColor = resPonseData.pacticeSecondaryColor;
    //             // this.apForm.patchValue({ contactName: resPonseData.contactName, email: resPonseData.email, practiceName: resPonseData.practiceName, practiceUrl: resPonseData.practiceUrl, practiceHomeUrl: resPonseData.practiceHomeUrl, locationName: resPonseData.locationName, streetaddress: resPonseData.streetaddress, city: resPonseData.city, stateCode: resPonseData.stateCode, zipcode: resPonseData.zipcode, mobileNumber: resPonseData.phoneNumber, mainColor: resPonseData.practiceMainColor, secondaryColor: resPonseData.pacticeSecondaryColor });
    //             // this.isListView = !this.isListView;
    //             // this.update_id=resPonseData.id
    //           }
    //         } else {
    //           this.service.showError('Invaild page');
    //           // this.apForm.reset();
    //         }
    //       },
    //       (err) => {
    //         this.service.showError('Invaild page');
    //       }
    //     );
    // }
    this.isListView = !this.isListView;
    this.apForm.patchValue(data);
    var rs = this.practiceList.filter(
      (x) => x.practicename == data.practicename
    );
    this.apForm.get('practiceName').setValue(rs[0].id);
    this.apForm.get('mobileNumber').setValue(data.mobile);
  }
}
