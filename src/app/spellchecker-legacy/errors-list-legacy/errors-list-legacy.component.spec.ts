import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorsListLegacyComponent } from './errors-list-legacy.component';

describe('ErrorsListComponent', () => {
  let component: ErrorsListLegacyComponent;
  let fixture: ComponentFixture<ErrorsListLegacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorsListLegacyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorsListLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
