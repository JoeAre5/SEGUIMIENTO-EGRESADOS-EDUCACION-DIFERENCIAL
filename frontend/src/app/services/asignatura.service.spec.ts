/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AsignaturaService } from './asignatura.service';

describe('Service: Asignatura', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsignaturaService]
    });
  });

  it('should ...', inject([AsignaturaService], (service: AsignaturaService) => {
    expect(service).toBeTruthy();
  }));
});
