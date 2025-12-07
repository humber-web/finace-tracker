PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "budgets" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-12-03T20:48:34.426Z"' NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO budgets VALUES(7,1,1000000,12,2025,1765050794,2);
INSERT INTO budgets VALUES(8,2,560000,12,2025,1765050794,2);
INSERT INTO budgets VALUES(9,20,100000,12,2025,1765050794,2);
INSERT INTO budgets VALUES(10,16,350000,12,2025,1765050794,2);
INSERT INTO budgets VALUES(11,17,300000,12,2025,1765050794,2);
CREATE TABLE IF NOT EXISTS "categories" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'expense' NOT NULL,
	`color` text DEFAULT 'gray',
	`icon` text,
	`created_at` integer DEFAULT '"2025-12-03T20:49:29.954Z"' NOT NULL
, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, is_system INTEGER DEFAULT 0);
INSERT INTO categories VALUES(1,'Alimentação e Refeições','expense','green','i-lucide-utensils',1764507744,2,1);
INSERT INTO categories VALUES(2,'Transporte','expense','blue','i-heroicons-truck',1764507744,2,1);
INSERT INTO categories VALUES(3,'Utilidades','expense','yellow','i-heroicons-tag',1764507744,2,1);
INSERT INTO categories VALUES(4,'Entretenimento','expense','purple','i-heroicons-film',1764507744,2,1);
INSERT INTO categories VALUES(5,'Compras','expense','pink','i-heroicons-shopping-cart',1764507744,2,1);
INSERT INTO categories VALUES(7,'Educação','expense','indigo','i-heroicons-academic-cap',1764507744,2,1);
INSERT INTO categories VALUES(8,'Outras Despesas','expense','gray','i-heroicons-ellipsis-horizontal',1764507744,2,1);
INSERT INTO categories VALUES(9,'Salário','income','green','i-heroicons-banknotes',1764507744,2,1);
INSERT INTO categories VALUES(10,'Trabalho Freelancer','income','emerald','i-heroicons-briefcase',1764507744,2,1);
INSERT INTO categories VALUES(11,'Investimentos','income','teal','i-lucide-trending-up',1764507744,2,1);
INSERT INTO categories VALUES(12,'Outros Rendimentos','income','lime','i-heroicons-plus-circle',1764507744,2,1);
INSERT INTO categories VALUES(14,'Renda','expense','red','i-heroicons-home',1764797433,2,1);
INSERT INTO categories VALUES(15,'Internet','expense','blue','i-lucide-wifi',1764797433,2,1);
INSERT INTO categories VALUES(16,'Electra','expense','red','i-lucide-lightbulb',1765050794,2,1);
INSERT INTO categories VALUES(17,'Agua','expense','blue','i-lucide-droplet',1765050794,2,1);
INSERT INTO categories VALUES(18,'Ajuda Familiar','expense','indigo','i-heroicons-tag',1765050794,2,1);
INSERT INTO categories VALUES(19,'Beleza ','expense','pink','i-lucide-sparkles',1765050794,2,1);
INSERT INTO categories VALUES(20,'Telemovel','expense','gray','i-lucide-smartphone',1765050794,2,1);
CREATE TABLE IF NOT EXISTS "transactions" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`type` text DEFAULT 'expense' NOT NULL,
	`category_id` integer,
	`created_at` integer DEFAULT '"2025-12-03T20:49:29.955Z"' NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO transactions VALUES(17,14832500,'Salario dos dois',1764633600,12,2025,'income',9,1765050794,2);
INSERT INTO transactions VALUES(18,3870000,'Presente Tio Kake',1764979200,12,2025,'income',12,1765050794,2);
INSERT INTO transactions VALUES(19,1800000,'Renta',1764979200,12,2025,'expense',14,1765050794,2);
INSERT INTO transactions VALUES(20,3482200,'Passagens para Praia ',1764979200,12,2025,'expense',8,1765050794,2);
INSERT INTO transactions VALUES(21,1047500,'Saidas pelo aniversario de Humberto',1764979200,12,2025,'expense',1,1765050794,2);
INSERT INTO transactions VALUES(22,1000000,'Ajuda Noelia',1764979200,12,2025,'expense',18,1765050794,2);
INSERT INTO transactions VALUES(23,348200,'Electra ',1764979200,12,2025,'expense',16,1765050794,2);
INSERT INTO transactions VALUES(24,529900,'Internet ',1764979200,12,2025,'expense',15,1765050794,2);
INSERT INTO transactions VALUES(25,100000,'Netflix',1764979200,12,2025,'expense',4,1765050794,2);
INSERT INTO transactions VALUES(26,510000,'Produtos Darianna e Pelodos ',1764979200,12,2025,'expense',19,1765050794,2);
INSERT INTO transactions VALUES(27,50000,'Movel Darianna',1764979200,12,2025,'expense',20,1765050794,2);
INSERT INTO transactions VALUES(28,2357800,'Compras Super Mercado',1764979200,12,2025,'expense',5,1765050794,2);
INSERT INTO transactions VALUES(29,2255000,'Ventoinha, Oculos, Roupa e calçado',1764979200,12,2025,'expense',5,1765050794,2);
INSERT INTO transactions VALUES(30,396000,'Taxi Darianna',1764979200,12,2025,'expense',2,1765050794,2);
INSERT INTO transactions VALUES(31,178000,'Gas Butano',1764979200,12,2025,'expense',3,1765050794,2);
INSERT INTO transactions VALUES(32,80000,'Piscina Humbertico',1764979200,12,2025,'expense',7,1765050794,2);
INSERT INTO transactions VALUES(33,200000,'Renovação de CIP',1764979200,12,2025,'expense',8,1765050794,2);
CREATE TABLE IF NOT EXISTS "recurring_transactions" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'expense' NOT NULL,
	`category_id` integer,
	`frequency` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`next_occurrence` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT '"2025-12-05T20:27:38.188Z"' NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO recurring_transactions VALUES(8,1800000,'Renda Mensal','expense',14,'monthly',1764979200,NULL,1767657600,1,1765056359,1);
INSERT INTO recurring_transactions VALUES(9,529900,'Internet','expense',15,'monthly',1761955200,NULL,1767657600,1,1765056388,1);
INSERT INTO recurring_transactions VALUES(10,100000,'Netflix','expense',4,'monthly',1761955200,NULL,1767657600,1,1765056440,1);
INSERT INTO recurring_transactions VALUES(11,2500000,'Copras Super Mercado','expense',5,'monthly',1761955200,NULL,1767657600,1,1765056554,1);
INSERT INTO recurring_transactions VALUES(12,560000,'Transporte Mensal','expense',2,'monthly',1761955200,NULL,1767657600,1,1765056689,1);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  email_verified INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER
);
INSERT INTO users VALUES(1,'admin@fintech.local','Admin User',NULL,1,1,1765131121000,NULL);
INSERT INTO users VALUES(2,'humberto.cvgeos@gmail.com','Humberto Rosabal','https://lh3.googleusercontent.com/a/ACg8ocKbQpvjB-ErIffMKskb9qpa7aBVrsFgjdxGqD34q6Yrs-4r9Q=s96-c',1,1,1765134586,1765134586);
CREATE TABLE oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);
INSERT INTO oauth_accounts VALUES(1,2,'google','111086174945082590374',NULL,NULL,NULL,1765134586);
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_accessed_at INTEGER
);
INSERT INTO sessions VALUES(1,2,'9136700fa6b9e3d3d21a6a463c1f205c8ab920112c540a951a25fe40ef63c7a1',1765739386,1765134586,1765135244);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('budgets',11);
INSERT INTO sqlite_sequence VALUES('categories',20);
INSERT INTO sqlite_sequence VALUES('transactions',35);
INSERT INTO sqlite_sequence VALUES('recurring_transactions',12);
INSERT INTO sqlite_sequence VALUES('users',2);
INSERT INTO sqlite_sequence VALUES('oauth_accounts',1);
INSERT INTO sqlite_sequence VALUES('sessions',1);
CREATE INDEX `category_month_year_idx` ON `budgets` (`category_id`,`month`,`year`);
CREATE INDEX `date_idx` ON `transactions` (`date`);
CREATE INDEX `month_year_idx` ON `transactions` (`month`,`year`);
CREATE INDEX `type_idx` ON `transactions` (`type`);
CREATE INDEX `next_occurrence_idx` ON `recurring_transactions` (`next_occurrence`);
CREATE INDEX `is_active_idx` ON `recurring_transactions` (`is_active`);
CREATE INDEX user_email_idx ON users(email);
CREATE INDEX provider_account_idx ON oauth_accounts(provider, provider_account_id);
CREATE INDEX oauth_user_idx ON oauth_accounts(user_id);
CREATE INDEX session_token_idx ON sessions(token);
CREATE INDEX session_user_idx ON sessions(user_id);
CREATE INDEX session_expires_idx ON sessions(expires_at);
CREATE INDEX transaction_user_idx ON transactions(user_id);
CREATE INDEX transaction_user_date_idx ON transactions(user_id, date);
CREATE INDEX budget_user_idx ON budgets(user_id);
CREATE INDEX budget_user_month_year_idx ON budgets(user_id, month, year);
CREATE INDEX recurring_user_idx ON recurring_transactions(user_id);
CREATE INDEX recurring_user_active_idx ON recurring_transactions(user_id, is_active);
CREATE INDEX category_user_idx ON categories(user_id);
CREATE INDEX category_system_idx ON categories(is_system);
COMMIT;
