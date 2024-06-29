import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLegacyComponent } from './error-legacy.component';

describe('ErrorComponent', () => {
  let component: ErrorLegacyComponent;
  let fixture: ComponentFixture<ErrorLegacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorLegacyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
