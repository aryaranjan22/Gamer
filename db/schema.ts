import { pgTable, text, integer, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
export const settings = pgTable('support_settings', {
  id: integer().primaryKey(), coffeeUrl: text('coffee_url').notNull().default(''), razorpayUrl: text('razorpay_url').notNull().default(''), message: text().notNull().default('Help keep paperweight moving.'), goalPaise: integer('goal_paise').notNull().default(0),
});
export const profiles = pgTable('player_profiles', { id: text().primaryKey(), name: text().notNull(), country: text().notNull().default('') });
export const scores = pgTable('game_scores', { userId: text('user_id').notNull().references(() => profiles.id), mode: text().notNull(), distance: integer().notNull(), updatedAt: timestamp('updated_at', {withTimezone:true}).defaultNow().notNull() }, t => [primaryKey({columns:[t.userId,t.mode]})]);
export const runs = pgTable('game_runs', { id: uuid().primaryKey(), userId: text('user_id').notNull(), mode: text().notNull(), startedAt: timestamp('started_at', {withTimezone:true}).defaultNow().notNull() });
export const donations = pgTable('confirmed_donations', { id: uuid().primaryKey(), name: text().notNull(), country: text().notNull().default(''), provider: text().notNull(), reference: text().notNull().unique(), amountPaise: integer('amount_paise').notNull(), createdAt: timestamp('created_at', {withTimezone:true}).defaultNow().notNull() });
