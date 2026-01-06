import { TestBed } from '@angular/core/testing';

import { PracticasService } from './practicas.service';

describe('PracticasService', () => {
  let service: PracticasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PracticasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
