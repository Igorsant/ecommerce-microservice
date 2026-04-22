exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('order_id').notNullable();
    table.enum('status', ['pending', 'approved', 'refused']).defaultTo('pending');
    table.decimal('amount', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};