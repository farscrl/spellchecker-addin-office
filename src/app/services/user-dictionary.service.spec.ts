import { TestBed } from '@angular/core/testing';

import { UserDictionaryService } from './user-dictionary.service';

describe('UserDictionaryService', () => {
  let service: UserDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
