import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgnoredWordsComponent } from './ignored-words.component';

describe('IgnoredWordsComponent', () => {
    let component: IgnoredWordsComponent;
    let fixture: ComponentFixture<IgnoredWordsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgnoredWordsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(IgnoredWordsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
