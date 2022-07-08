import { Repository } from "typeorm";
import appDataSource from "../../../database";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = appDataSource.getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
    recipient_id,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      recipient_id,
      sender_id
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | null> {
    return this.repository.findOne({
      where: {
        id: statement_id,
        user_id,
      }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = await this.repository.createQueryBuilder("statement")
    .where("statement.user_id = :user_id", { user_id })
    .orWhere("statement.recipient_id = :recipient_id", { recipient_id: user_id })
    .getMany()

    const recipient_id = statement.map(({ recipient_id }) => recipient_id);

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc += operation.amount;
      }
      if (operation.type === 'transfer' && recipient_id) {
        return acc += operation.amount;
      }
      if(operation.type === 'transfer' && !recipient_id) {
        return acc -= operation.amount;
      }
      if(operation.type === 'withdraw') {
        return acc -= operation.amount;
      }
      return acc;
    }, 0)
    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
