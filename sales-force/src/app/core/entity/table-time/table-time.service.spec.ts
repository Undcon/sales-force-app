import { TestBed } from '@angular/core/testing';

import { TableTimeService } from './table-time.service';

describe('TableTimeService', () => {
  let service: TableTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
