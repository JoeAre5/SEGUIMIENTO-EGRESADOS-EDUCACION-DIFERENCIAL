import { TestBed } from '@angular/core/testing';

import { EgresadosService } from './egresados.service';

describe('EgresadosService', () => {
  let service: EgresadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EgresadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
