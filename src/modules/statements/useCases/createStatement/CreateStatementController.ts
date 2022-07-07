import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { recipient_id } = request.params;

    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/')

    const type = (splittedPath.length > 5 ?  splittedPath[splittedPath.length - 2]  as OperationType
      : splittedPath[splittedPath.length - 1]  as OperationType);

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      recipient_id,
      sender_id: user_id,
    });

    return response.status(201).json(statement);
  }
}
