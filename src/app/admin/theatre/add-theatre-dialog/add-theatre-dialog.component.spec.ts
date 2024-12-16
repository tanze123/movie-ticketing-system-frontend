import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTheatreDialogComponent } from './add-theatre-dialog.component';

describe('AddTheatreDialogComponent', () => {
  let component: AddTheatreDialogComponent;
  let fixture: ComponentFixture<AddTheatreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTheatreDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTheatreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
