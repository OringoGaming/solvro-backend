import { Test, TestingModule } from '@nestjs/testing';
import { Seed } from './seed.js';

describe('Seed', () => {
  let provider: Seed;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Seed],
    }).compile();

    provider = module.get<Seed>(Seed);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
