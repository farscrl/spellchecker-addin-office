import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpellcheckerLegacyComponent } from './spellchecker-legacy.component';

describe('SpellcheckerComponent', () => {
    let component: SpellcheckerLegacyComponent;
    let fixture: ComponentFixture<SpellcheckerLegacyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SpellcheckerLegacyComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SpellcheckerLegacyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
