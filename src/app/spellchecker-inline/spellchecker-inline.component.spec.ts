import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpellcheckerInlineComponent } from './spellchecker-inline.component';

describe('SpellcheckerInlineComponent', () => {
  let component: SpellcheckerInlineComponent;
  let fixture: ComponentFixture<SpellcheckerInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpellcheckerInlineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpellcheckerInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
