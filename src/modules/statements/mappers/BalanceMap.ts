import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {



    /*const parsedStatement = statement.map(({
      id,
      amount,
      description,
      recipient_id,
      sender_id,
      type,
      created_at,
      updated_at
    }) => (
      {
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
        sender_id,
        recipient_id
      }
    ));
 */
const parsedStatement = statement.map(
  ({
    id,
    type,
    amount,
    created_at,
    updated_at,
    sender_id,
    recipient_id
  }
    ) => {
    if(recipient_id) {
      return {
        id,
        type,
        amount: Number(amount),
        recipient_id,
        sender_id,
        created_at,
        updated_at,
      }
    }
    return {
      id,
      type,
      amount: Number(amount),
      created_at,
      updated_at,
    }
  }
);

    return {
      statement: parsedStatement,
      balance
    }
  }
}
