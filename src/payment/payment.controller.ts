import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateReceiptDTO } from './dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/create-receipt')
  async createReceipt(@Body() dto: CreateReceiptDTO) {
    return this.paymentService.createReceipt(dto);
  }
  @Post('get-receipts/:transactionId')
  async getReceipts(@Param('transactionId') transactionId: string) {
    return this.paymentService.getReceipts(transactionId);
  }
}
