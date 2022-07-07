import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AltertableStatements1657212277572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumns('statements',[
        new TableColumn(
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: true,
          }
        ),
        new TableColumn(
          {
            name: 'recipient_id',
            type: 'uuid',
            isNullable: true,
          }
        ),
      ]);
      await queryRunner.createForeignKeys('statements',[
        new TableForeignKey({
          name: 'FKStatementUserSender',
          columnNames: ['sender_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
        }),
        new TableForeignKey({
          name: 'FKStatementUserRecipient',
          columnNames: ['recipient_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
        })
      ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'FKStatementUserSender');
      await queryRunner.dropForeignKey('statements', 'FKStatementUserRecipient');

      await queryRunner.dropColumns('statements',[
        new TableColumn({
        name: 'sender_id',
        type: 'uuid',
      }),
      new TableColumn({
        name: 'recipient_id',
        type: 'uuid',
      }),
    ]);
    }

}
