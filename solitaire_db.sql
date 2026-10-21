-- Create/Select project database
DROP DATABASE IF EXISTS solitaire_db;
CREATE DATABASE IF NOT EXISTS solitaire_db;
USE solitaire_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
	user_id 		INT 			AUTO_INCREMENT 		PRIMARY KEY,
	username 		VARCHAR(50) 	NOT NULL 			UNIQUE,
    email 			VARCHAR(100) 	NOT NULL 			UNIQUE,
    password_hash 	VARCHAR(255) 	NOT NULL
);

-- Theme Config Table
CREATE TABLE IF NOT EXISTS theme_config (
	theme_id 		INT 			AUTO_INCREMENT 		PRIMARY KEY,
    theme_name 		VARCHAR(50) 	NOT NULL,
    card_back_asset VARCHAR(255) 	NOT NULL,
    background_img 	VARCHAR(255) 	NOT NULL,
    asset_pack_path VARCHAR(255) 	NOT NULL
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
	setting_id 			INT 			AUTO_INCREMENT 		PRIMARY KEY,
    user_id 			INT 			NOT NULL,
    selected_theme_id 	INT 			DEFAULT 1,
    sfx_enabled 		BOOLEAN 		DEFAULT TRUE,
    sfx_volume 			INT 			DEFAULT 80,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) references users(user_id),
    CONSTRAINT fk_settings_theme FOREIGN KEY (selected_theme_id) references theme_config(theme_id)
);
-- Saved Games Table
CREATE TABLE IF NOT EXISTS saved_games (
	game_id 			INT 			AUTO_INCREMENT 		PRIMARY KEY,
    user_id 			INT 			NOT NULL,
    layout_state 		JSON 			NOT NULL,
    foundation_state 	JSON 			NOT NULL,
    stock_waste_state 	JSON 			NOT NULL,
    current_score 		INT 			DEFAULT 0,
    last_saved_at 		TIMESTAMP 		DEFAULT 			CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_games_user FOREIGN KEY (user_id) references users(user_id)
);