/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { DiagnosticosService } from './diagnosticos.service';

describe('Service: Diagnosticos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagnosticosService]
    });
  });

  it('should ...', inject([DiagnosticosService], (service: DiagnosticosService) => {
    expect(service).toBeTruthy();
  }));
});
