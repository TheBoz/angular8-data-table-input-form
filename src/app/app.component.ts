import { Component, OnInit } from '@angular/core';
import { BackEndService } from './services/back-end.service';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';

import { Company } from './models/company';

// Extend Class so I can add a few properties
class FormRow extends Company {
  // Store the Index of the array element for better performance in FormArray Handling
  public Index = 0;
  // Value to store the toggle bit for the Additional Information Div
  public HideShowToggle = false;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public rows: FormRow[] = [];
  public form: FormGroup;
  public changeCollection: FormRow[] = [];

  constructor(
    private backEndService: BackEndService,
    private formBuilder: FormBuilder,
  ) {
    // Create the initial Reactive Form with an empty Form Array
    // which we will populate after the data is fetched
    this.form = this.formBuilder.group({
      employees: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    // Fetch the company data from our local JSON file
    this.backEndService.getCompanyData()
      .subscribe((data) => {

        // Limit # of data rows
        data = data.slice(0, 10);

        // Can't assign the API results directly to our extended class, so we use Object.assign to do it
        // this.rows = data;
        this.rows = Object.assign(data);

        console.log('# of data rows loaded: ', this.rows.length);

        // Post processing
        let idx = 0;
        this.rows.forEach((row) => {
          // Store Array Index with data
          // NOTE: THIS IS KEY to the form working correctly as it is used byour trackBy function.
          row.Index = idx;
          idx++;
        });

        // console.log(this.rows);
        // Populate the form array
        this.buildForm(this.rows);

      });
  }

  buildForm(result: FormRow[]) {
    this.form = this.formBuilder.group({
      employees: this.formBuilder.array(
        result.map(x =>
          this.formBuilder.group({
            Index: [x.Index],
            name: [x.name],
            gender: [x.gender],
            company: [x.company]
          }))
      )
    });
  }

  // Used by Angular to track the order of our Form Array Items
  trackByFn(index: number, item: FormRow): number {
    return item.Index;
  }

  saveChanges() {
    console.log('save form changes...');

    // Cycle thru each formArray row and only save the rows that have been updated
    this.changeCollection = [];

    if (this.form.controls.employees.pristine === false) {

      const formArray: FormArray = this.form.controls.employees as FormArray;
      for (let i = 0; i < formArray.controls.length; i++) {
        if (formArray.controls[i].pristine === false) {
          // changeCollection.push(formArray.value[i]);
          const obj: FormRow = new FormRow();
          Object.assign(obj, formArray.value[i]);
          this.changeCollection.push(obj);
        }
      }
    }

    if (this.changeCollection.length > 0) {
      console.log('ChangeCollection: ', this.changeCollection);

      // Make updates to rows collection so I can rebuild the form
      this.changeCollection.forEach((item) => {
        const row = this.rows.find(x => x.Index === item.Index);
        if (row) {
          row.name = item.name;
          row.gender = item.gender;
          row.company = item.company;
        }
      });

      // console.log(this.rows);

      this.resetChanges();
    }

  }

  resetChanges() {
    console.log('reset form changes...');
    this.form.reset(this.form.value);
    this.buildForm(this.rows);
  }

  sortBy(col: string) {
    console.log("Sort By ", col);

    switch (col) {
      case "index":
        this.rows.sort((a, b) => {
          if (a.Index > b.Index) {
            return 1;
          } else if (a.Index < b.Index) {
            return -1;
          }
          return 0;
        });
        break;
      case "name":
        this.rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "gender":
        this.rows.sort((a, b) => a.gender.localeCompare(b.gender));
        break;
      case "company":
        this.rows.sort((a, b) => a.company.localeCompare(b.company));
        break;
    }
  }


  checkRowIsDirty(row: FormRow) {
    let isDirty = false;

    const formArray: FormArray = this.form.controls.employees as FormArray;
    if (formArray.controls[row.Index].dirty) {
      isDirty = true;
    }

    return isDirty;
  }


}
