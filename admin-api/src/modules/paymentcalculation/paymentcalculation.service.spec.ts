import { Test, TestingModule } from '@nestjs/testing';
import { PaymentcalculationService } from './paymentcalculation.service';

describe('PaymentcalculationService', () => {
  let service: PaymentcalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentcalculationService],
    }).compile();

    service = module.get<PaymentcalculationService>(PaymentcalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
