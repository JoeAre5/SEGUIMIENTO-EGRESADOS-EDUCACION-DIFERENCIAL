import { TestBed } from '@angular/core/testing';

import { EndService } from './end.service';

describe('EndService', () => {
  let service: EndService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
