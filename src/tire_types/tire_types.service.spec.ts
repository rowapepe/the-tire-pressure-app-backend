import { Test, TestingModule } from '@nestjs/testing';
import { TireTypesService } from './tire_types.service';

describe('TireTypesService', () => {
  let service: TireTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TireTypesService],
    }).compile();

    service = module.get<TireTypesService>(TireTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
