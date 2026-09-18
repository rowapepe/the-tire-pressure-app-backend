import { Test, TestingModule } from '@nestjs/testing';
import { TireTypesController } from './tire_types.controller';

describe('TireTypesController', () => {
  let controller: TireTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TireTypesController],
    }).compile();

    controller = module.get<TireTypesController>(TireTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
