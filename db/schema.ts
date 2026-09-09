import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const progress = sqliteTable('florir_progress', {
  userId: text('user_id').primaryKey(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});
