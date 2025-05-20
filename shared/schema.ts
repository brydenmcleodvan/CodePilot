import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, text, serial, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  roles: text('roles').array().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  preferences: json('preferences'),
  profileImage: text('profile_image'),
  bio: text('bio')
});

// Forum posts table
export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  tags: text('tags').array(),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  viewCount: integer('view_count').default(0)
});

// Health articles table
export const healthArticles = pgTable('health_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  author: text('author'),
  publishDate: timestamp('publish_date').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  categories: text('categories').array(),
  imageUrl: text('image_url'),
  source: text('source'),
  isPublished: boolean('is_published').default(true)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true });
export const insertHealthArticleSchema = createInsertSchema(healthArticles).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type HealthArticle = typeof healthArticles.$inferSelect;
export type InsertHealthArticle = z.infer<typeof insertHealthArticleSchema>;