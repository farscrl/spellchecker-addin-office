import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpellcheckerComponent } from './spellchecker.component';

describe('SpellcheckerComponent', () => {
  let component: SpellcheckerComponent;
  let fixture: ComponentFixture<SpellcheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpellcheckerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpellcheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
