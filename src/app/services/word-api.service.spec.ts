import { TestBed } from '@angular/core/testing';

import { WordApiService } from './word-api.service';

describe('WordApiService', () => {
  let service: WordApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
