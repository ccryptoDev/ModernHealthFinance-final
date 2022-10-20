import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { CommonDataInatance } from 'src/app/_service/comman.service';
import { HttpService } from 'src/app/_service/http.service';
import { readyMade } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
//import { PracticeEntity } from '../../../../../admin-api/src/entities/practice.entity';;

const color = {
  practiceMainColor: '#539641',
  practiceSecondaryColor: '#F1B649'
};

@Component({
  selector: 'app-practice-management',
  templateUrl: './practice-management.component.html',
  styleUrls: ['./practice-management.component.scss'],
})
export class PracticeManagementComponent implements OnInit {
  data: any = [];
  dataSettings: any = [];
  isListView: boolean = true;
  apForm: FormGroup;
  apibtn: boolean = false;
  stateList: any = [];
  message: any = [];
  modalRef: BsModalRef;
  practiceMainColor: string;
  practiceSecondaryColor: string;
  practiceLogo: string;
  practicePoweredByLogo: string;
  // public files: NgxFileDropEntry[] = [];
  files = [];
  public listfiles: any = [];
  fileNames: any = [];
  createId: any;
  fileitems: any = [];
  fileitemsTwo: any = [];
  preFileitems: any = [];
  preFileitemsTwo: any = [];
  isShowbtn: boolean = false;

  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  @ViewChild('takeInput', { static: false }) updateId: any;
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.practiceMainColor = null;
    this.practiceSecondaryColor = null;

    this.stateList = CommonDataInatance.stateList();
    this.get();
    //this.getSettingsRules()
    this.apForm = this.formBuilder.group({
      contactName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      email: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.email)],
      ],
      practiceName: [
        '',
        [Validators.required],
      ],
      practiceUrl: [''],
      practiceHomeUrl: [''],
      locationName: ['', [Validators.required]],
      streetaddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      stateCode: [null, [Validators.required]],
      zipcode: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(readyMade.pattern.number),
        ],
      ],
      mobileNumber: ['', [Validators.required]],
      practiceSettings: ['', [Validators.required]],
      practiceMainColor: [color.practiceMainColor],
      practiceSecondaryColor: [color.practiceSecondaryColor],
      practicelogo: [''],
      practicepoweredbylogo: [''],
    });
  }
  get apiFormvalidation() {
    return this.apForm.controls;
  }
  getSettingsRules() {
    this.service
      .authget('practicerules/getAllPracticeRules', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.dataSettings = res['data'];
          } else {
            // this.service.showError("Invaild page");
          }
        },
        (err) => {
          console.log(err);
          //this.service.showError("Invaild page");
        }
      );
  }

  get() {
    setTimeout(() => {
      this.service
        .authget('practice', 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.data = res['allPractice'];
              this.getSettingsRules();
            } else {
              this.service.showError('Invaild page');
            }
          },
          (err) => {
            console.log(err);
            this.service.showError('Invaild page');
          }
        );
    }, 1000);
  }
  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      let data = this.apForm.value;
      let sendData = {
        contactName: data.contactName,
        email: data.email,
        practiceName: data.practiceName,
        practiceUrl: data.practiceUrl,
        practiceHomeUrl: data.practiceHomeUrl,
        practiceLinkToForm: 'linktoForm',
        locationName: data.locationName,
        streetaddress: data.streetaddress,
        city: data.city,
        stateCode: data.stateCode,
        zipcode: data.zipcode,
        phoneNumber: data.mobileNumber,
        practiceSettings: data.practiceSettings,
        practiceMainColor: this.practiceMainColor || '',
        pacticeSecondaryColor: this.practiceSecondaryColor || '',
        practicelogo: this.practiceLogo || '',
        practicepoweredbylogo: this.practicePoweredByLogo || '',
      };
      if (this.updateId != null) {
        //If data length > 0 Update Api Call
        this.service
          .authput(`practice/edit/${this.updateId}`, 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res) => {
              this.apibtn = false;
              if (res['statusCode'] == 200) {
                this.isListView = true;
                this.service.showSuccess('Successfully Updated');
                this.get();
              } else {
                this.message = [res['message']];
                this.modalRef = this.modalService.show(this.messagebox);
              }
            },
            (err) => {
              console.log(err);
            }
          );
      } else {
        /// IF data null or empty Add API Call
        this.service
          .post('practice/create', 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res) => {
              if (res['statusCode'] == 200) {
                this.createId = res['practiceDetails']['id'];
                this.isListView = true;
                this.service.showSuccess('Successfully Saved');
                //this.get();
                this.ngOnInit();
              } else {
                this.message = [res['message']];
                this.modalRef = this.modalService.show(this.messagebox);
              }
            },
            (err) => {
              console.log(err);
            }
          );
      }
    } else {
      console.log('Form Invalid!', this.apForm);
    }
  }

  close(): void {
    this.modalRef.hide();
  }

  getPracticeLogo() {
    return this.practiceLogo;
  }

  getPracticePoweredByLogo() {
    return this.practicePoweredByLogo;
  }

  isFileAllowed(droppedFile: any) {
    return droppedFile.type.startsWith('image/');
  }

  filepicker(type: 'main' | 'poweredby') {
    const picker = document.createElement('input');
    picker.setAttribute('type', 'file');
    picker.setAttribute('accept', "image/*");
    picker.addEventListener('change', () => {
      if (picker.files.length !== 1 || !this.isFileAllowed(picker.files[0])) {
        console.error('Failed to select a file');
      }
      const reader = new FileReader();
      reader.readAsDataURL(picker.files[0]);
      reader.onload = () => {
        if (type === 'main') {
          this.practiceLogo = reader.result.toString();
        } else {
          this.practicePoweredByLogo = reader.result.toString();
        }
      }
    });

    picker.click();
  }

  removeLogo(type: 'main' | 'poweredby') {
    if (type === 'main') {
      this.practiceLogo = null;
    } else {
      this.practicePoweredByLogo = null;
    }
  }

  createPractice() {
    this.isListView = false;
    setTimeout(() => {
      (document.getElementById('practiceMainColor') as HTMLInputElement).value = color.practiceMainColor;
      (document.getElementById('practiceSecondaryColor') as HTMLInputElement).value = color.practiceSecondaryColor;
    });
  }

  editPracticeData(id: string) {
    this.apibtn = false;
    this.isListView = false;
    if (id) {
      this.service
        .authget(`practice/${id}`, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.isShowbtn = true;
              let resPonseData = res['practice'];
              if (Object.keys(resPonseData).length > 0) {
                (document.getElementById('practiceMainColor') as HTMLInputElement).value = resPonseData.practicemaincolor || color.practiceMainColor;
                (document.getElementById('practiceSecondaryColor') as HTMLInputElement).value = resPonseData.practicesecondarycolor || color.practiceSecondaryColor;
                this.practiceMainColor = resPonseData.practicemaincolor || null;
                this.practiceSecondaryColor = resPonseData.practicesecondarycolor || null;
                this.practiceLogo = resPonseData.practicelogo || null;
                this.practicePoweredByLogo = resPonseData.practicepoweredbylogo || null;
                this.getFileDetails(id, Boolean(resPonseData.practicelogo), Boolean(resPonseData.practicepoweredbylogo));
                this.apForm.patchValue({
                  contactName: resPonseData.contactname,
                  email: resPonseData.email,
                  practiceName: resPonseData.practicename,
                  practiceUrl: resPonseData.practiceurl,
                  practiceHomeUrl: resPonseData.practicehomeurl,
                  locationName: resPonseData.locationname,
                  streetaddress: resPonseData.streetaddress,
                  city: resPonseData.city,
                  stateCode: resPonseData.statecode,
                  zipcode: resPonseData.zipcode,
                  mobileNumber: resPonseData.phonenumber,
                  practiceSettings: resPonseData.practicesettings,
                });

                this.updateId = resPonseData.id;
              }
            } else {
              this.service.showError('Invaild page');
              this.apForm.reset();
            }
          },
          (err) => {
            this.service.showError('Invaild page');
          }
        );
    }
  }

  getFileDetails(id: string, main: boolean, poweredby: boolean) {
    main && this.service
      .get('files/practicelogo/' + id, 'admin')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.fileitems = res.data;
          this.preFileitems = res.data;
        }
      });
      poweredby && this.service
      .get('files/practicepowerlogo/' + id, 'admin')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.fileitemsTwo = res.data;
          this.preFileitemsTwo = res.data;
        }
      });
  }

  colorChange(t, type: 'main' | 'secondary') {
    if (type == 'main') {
      this.practiceMainColor = t.target.value;
    } else {
      this.practiceSecondaryColor = t.target.value;
    }
  }

  setDefault(v: 'main' | 'secondary') {
    try {
      if (v === 'main') {
        this.practiceMainColor = null;
        (document.getElementById('practiceMainColor') as HTMLInputElement).value = color.practiceMainColor;
      } else {
        this.practiceSecondaryColor = null;
        (document.getElementById('practiceSecondaryColor') as HTMLInputElement).value = color.practiceSecondaryColor;
      }
    } catch {}
  }

  isDefault(v: 'main' | 'secondary') {
    if (v === 'main') {
      return Boolean(this.practiceMainColor);
    } else {
      return Boolean(this.practiceSecondaryColor);
    }
  }
 
  // Handler for "Back" button which closes practice editing form
  closeFormWithoutSaving() {
    this.isListView = true;
    this.apForm.reset();
    this.practiceMainColor = null;
    this.practiceSecondaryColor = null;
    this.practiceLogo = null;
    this.practicePoweredByLogo = null;
  }
}
