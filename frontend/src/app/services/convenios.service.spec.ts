/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ConveniosService } from './convenios.service';

describe('Service: Convenios', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConveniosService]
    });
  });

  it('should ...', inject([ConveniosService], (service: ConveniosService) => {
    expect(service).toBeTruthy();
  }));
});
