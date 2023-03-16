import { TestBed } from '@angular/core/testing';

import { SpellcheckerService } from './spellchecker.service';

describe('SpellcheckerService', () => {
  let service: SpellcheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpellcheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
