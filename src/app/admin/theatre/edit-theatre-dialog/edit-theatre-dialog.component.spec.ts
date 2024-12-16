import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTheatreDialogComponent } from './edit-theatre-dialog.component';

describe('EditTheatreDialogComponent', () => {
  let component: EditTheatreDialogComponent;
  let fixture: ComponentFixture<EditTheatreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTheatreDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTheatreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
