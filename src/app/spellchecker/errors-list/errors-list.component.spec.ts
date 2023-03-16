import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorsListComponent } from './errors-list.component';

describe('ErrorsListComponent', () => {
  let component: ErrorsListComponent;
  let fixture: ComponentFixture<ErrorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
