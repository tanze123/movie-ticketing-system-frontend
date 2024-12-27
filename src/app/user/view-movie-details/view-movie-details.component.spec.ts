import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMovieDetailsComponent } from './view-movie-details.component';

describe('ViewMovieDetailsComponent', () => {
  let component: ViewMovieDetailsComponent;
  let fixture: ComponentFixture<ViewMovieDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMovieDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMovieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
