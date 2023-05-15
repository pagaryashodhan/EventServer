import { Injectable } from '@nestjs/common';
import { failureReturn, successfullReturn } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReceiptDTO } from './dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}
  async createReceipt(dto: CreateReceiptDTO) {
    try {
      const receipt = await this.prisma.payment.create({
        data: {
          amount: dto.amount,
          eventName: dto.event_name,
          paymentDate: Date.now().toString(),
          paymentMode: dto.payment_mode,
          transactionId: dto.transaction_id,
          teams: dto.team_members,
          User: {
            connect: {
              id: dto.user_id,
            },
          },
        },
      });
      if (!receipt) {
        return failureReturn('Something Went Wrong');
      }
      return successfullReturn(receipt, 'Receipt created successfully');
    } catch (error) {
      return failureReturn(error);
    }
  }
  async getReceipts(transaction_id: string) {
    try {
      const receipts = await this.prisma.payment.findFirst({
        where: {
          transactionId: transaction_id,
        },
      });
      return successfullReturn(receipts, 'Receipts fetched succesfully');
    } catch (error) {
      return failureReturn(error);
    }
  }
}
