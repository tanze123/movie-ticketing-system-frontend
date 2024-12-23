import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCutomerDetailsComponent } from './edit-cutomer-details.component';

describe('EditCutomerDetailsComponent', () => {
  let component: EditCutomerDetailsComponent;
  let fixture: ComponentFixture<EditCutomerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCutomerDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCutomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
