import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTheatreComponent } from './view-theatre.component';

describe('ViewTheatreComponent', () => {
  let component: ViewTheatreComponent;
  let fixture: ComponentFixture<ViewTheatreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTheatreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTheatreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
