export class CreateReceiptDTO {
  transaction_id: string;
  amount: number;
  event_name: string;
  payment_mode: string;
  user_id: string;
  team_members: string[];
  // team_college: string[];
}
