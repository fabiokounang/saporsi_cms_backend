"use strict";

const { getPool } = require("./db");

const CHARSET = "DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

const TABLES = [
  `CREATE TABLE IF NOT EXISTS \`hero\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(255) DEFAULT NULL,
    \`badge_en\` varchar(255) DEFAULT NULL,
    \`title_id\` varchar(200) DEFAULT '',
    \`title_en\` varchar(200) DEFAULT '',
    \`subtitle_id\` text,
    \`subtitle_en\` text,
    \`cta_label_id\` varchar(80) DEFAULT '',
    \`cta_label_en\` varchar(80) DEFAULT '',
    \`cta_url\` varchar(255) DEFAULT '#',
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`hero_images\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`image_path\` varchar(255) NOT NULL,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_navbar\` (
    \`id\` int NOT NULL,
    \`logo_path\` varchar(255) DEFAULT '',
    \`cta_label_id\` varchar(80) DEFAULT 'Pesan Mesin',
    \`cta_label_en\` varchar(80) DEFAULT 'Order Machine',
    \`cta_url\` varchar(255) DEFAULT '#',
    \`show_language_toggle\` tinyint(1) DEFAULT 1,
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_navbar_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`label_id\` varchar(80) NOT NULL,
    \`label_en\` varchar(80) NOT NULL,
    \`url\` varchar(255) NOT NULL,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_about\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(120) DEFAULT '',
    \`badge_en\` varchar(120) DEFAULT '',
    \`title_id\` varchar(200) DEFAULT '',
    \`title_en\` varchar(200) DEFAULT '',
    \`description_id\` text,
    \`description_en\` text,
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_about_cards\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`card_type\` varchar(20) NOT NULL,
    \`title_id\` varchar(120) DEFAULT '',
    \`title_en\` varchar(120) DEFAULT '',
    \`description_id\` text,
    \`description_en\` text,
    \`theme\` varchar(20) DEFAULT 'orange',
    \`icon_key\` varchar(30) DEFAULT '',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uniq_card_type\` (\`card_type\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_about_points\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`title_id\` varchar(120) DEFAULT '',
    \`title_en\` varchar(120) DEFAULT '',
    \`description_id\` text,
    \`description_en\` text,
    \`icon_key\` varchar(30) DEFAULT '',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_services\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(120) DEFAULT '',
    \`badge_en\` varchar(120) DEFAULT '',
    \`title_id\` varchar(200) DEFAULT '',
    \`title_en\` varchar(200) DEFAULT '',
    \`subtitle_id\` varchar(300) DEFAULT '',
    \`subtitle_en\` varchar(300) DEFAULT '',
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_services_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`title_id\` varchar(120) DEFAULT '',
    \`title_en\` varchar(120) DEFAULT '',
    \`description_id\` varchar(260) DEFAULT '',
    \`description_en\` varchar(260) DEFAULT '',
    \`icon_key\` varchar(200) DEFAULT '',
    \`accent\` varchar(20) DEFAULT 'orange',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_how_it_works\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`badge_id\` varchar(120) DEFAULT NULL,
    \`badge_en\` varchar(120) DEFAULT NULL,
    \`title_id\` varchar(160) DEFAULT NULL,
    \`title_en\` varchar(160) DEFAULT NULL,
    \`subtitle_id\` text,
    \`subtitle_en\` text,
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_how_it_works_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`title_id\` varchar(160) DEFAULT NULL,
    \`title_en\` varchar(160) DEFAULT NULL,
    \`description_id\` text,
    \`description_en\` text,
    \`icon_path\` varchar(150) DEFAULT NULL,
    \`sort_order\` int DEFAULT 999,
    \`is_active\` tinyint(1) DEFAULT 1,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_gallery\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(120) DEFAULT '',
    \`badge_en\` varchar(120) DEFAULT '',
    \`title_id\` varchar(200) DEFAULT '',
    \`title_en\` varchar(200) DEFAULT '',
    \`subtitle_id\` varchar(300) DEFAULT '',
    \`subtitle_en\` varchar(300) DEFAULT '',
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_gallery_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`label_id\` varchar(80) DEFAULT '',
    \`label_en\` varchar(80) DEFAULT '',
    \`image_path\` varchar(255) DEFAULT '',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_locations\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(120) DEFAULT '',
    \`badge_en\` varchar(120) DEFAULT '',
    \`title_id\` varchar(200) DEFAULT '',
    \`title_en\` varchar(200) DEFAULT '',
    \`subtitle_id\` varchar(300) DEFAULT '',
    \`subtitle_en\` varchar(300) DEFAULT '',
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_location_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`title_id\` varchar(120) DEFAULT '',
    \`title_en\` varchar(120) DEFAULT '',
    \`icon_key\` varchar(30) DEFAULT '',
    \`accent\` varchar(20) DEFAULT 'orange',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_partners\` (
    \`id\` int NOT NULL,
    \`badge_id\` varchar(120) DEFAULT NULL,
    \`badge_en\` varchar(120) DEFAULT NULL,
    \`title_id\` varchar(200) DEFAULT NULL,
    \`title_en\` varchar(200) DEFAULT NULL,
    \`subtitle_id\` varchar(300) DEFAULT NULL,
    \`subtitle_en\` varchar(300) DEFAULT NULL,
    \`cta_label_id\` varchar(100) DEFAULT NULL,
    \`cta_label_en\` varchar(100) DEFAULT NULL,
    \`cta_url\` varchar(200) DEFAULT NULL,
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_partner_items\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`name_id\` varchar(120) DEFAULT NULL,
    \`name_en\` varchar(120) DEFAULT NULL,
    \`logo_path\` varchar(255) DEFAULT NULL,
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_early_program\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`label_id\` varchar(255) DEFAULT NULL,
    \`label_en\` varchar(255) DEFAULT NULL,
    \`title_id\` varchar(255) DEFAULT NULL,
    \`title_en\` varchar(255) DEFAULT NULL,
    \`desc_id\` text,
    \`desc_en\` text,
    \`highlight_title_id\` varchar(255) DEFAULT NULL,
    \`highlight_title_en\` varchar(255) DEFAULT NULL,
    \`highlight_desc_id\` text,
    \`highlight_desc_en\` text,
    \`benefits_title_id\` varchar(255) DEFAULT NULL,
    \`benefits_title_en\` varchar(255) DEFAULT NULL,
    \`cta_primary_id\` varchar(255) DEFAULT NULL,
    \`cta_primary_en\` varchar(255) DEFAULT NULL,
    \`cta_primary_url\` varchar(255) DEFAULT NULL,
    \`cta_secondary_id\` varchar(255) DEFAULT NULL,
    \`cta_secondary_en\` varchar(255) DEFAULT NULL,
    \`cta_secondary_url\` varchar(255) DEFAULT NULL,
    \`right_title_id\` varchar(255) DEFAULT NULL,
    \`right_title_en\` varchar(255) DEFAULT NULL,
    \`right_badge_id\` varchar(255) DEFAULT NULL,
    \`right_badge_en\` varchar(255) DEFAULT NULL,
    \`right_desc_id\` text,
    \`right_desc_en\` text,
    \`kpi1_label_id\` varchar(100) DEFAULT NULL,
    \`kpi1_label_en\` varchar(100) DEFAULT NULL,
    \`kpi1_value_id\` varchar(255) DEFAULT NULL,
    \`kpi1_value_en\` varchar(255) DEFAULT NULL,
    \`kpi2_label_id\` varchar(100) DEFAULT NULL,
    \`kpi2_label_en\` varchar(100) DEFAULT NULL,
    \`kpi2_value_id\` varchar(255) DEFAULT NULL,
    \`kpi2_value_en\` varchar(255) DEFAULT NULL,
    \`kpi3_label_id\` varchar(100) DEFAULT NULL,
    \`kpi3_label_en\` varchar(100) DEFAULT NULL,
    \`kpi3_value_id\` varchar(255) DEFAULT NULL,
    \`kpi3_value_en\` varchar(255) DEFAULT NULL,
    \`kpi4_label_id\` varchar(100) DEFAULT NULL,
    \`kpi4_label_en\` varchar(100) DEFAULT NULL,
    \`kpi4_value_id\` varchar(255) DEFAULT NULL,
    \`kpi4_value_en\` varchar(255) DEFAULT NULL,
    \`note_title_id\` varchar(255) DEFAULT NULL,
    \`note_title_en\` varchar(255) DEFAULT NULL,
    \`note_desc_id\` text,
    \`note_desc_en\` text,
    \`right_cta_primary_id\` varchar(255) DEFAULT NULL,
    \`right_cta_primary_en\` varchar(255) DEFAULT NULL,
    \`right_cta_primary_url\` varchar(255) DEFAULT NULL,
    \`whatsapp_url\` varchar(255) DEFAULT NULL,
    \`float_title_id\` varchar(255) DEFAULT NULL,
    \`float_title_en\` varchar(255) DEFAULT NULL,
    \`float_sub_id\` varchar(255) DEFAULT NULL,
    \`float_sub_en\` varchar(255) DEFAULT NULL,
    \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_early_program_benefits\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`program_id\` int NOT NULL DEFAULT 1,
    \`title_id\` varchar(255) DEFAULT NULL,
    \`title_en\` varchar(255) DEFAULT NULL,
    \`description_id\` text,
    \`description_en\` text,
    \`icon_path\` varchar(255) DEFAULT NULL,
    \`accent\` varchar(30) DEFAULT NULL,
    \`sort_order\` int NOT NULL DEFAULT 999,
    \`is_active\` tinyint NOT NULL DEFAULT 1,
    \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_contact\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`badge_id\` varchar(120) NOT NULL,
    \`badge_en\` varchar(120) NOT NULL,
    \`title_id\` varchar(180) NOT NULL,
    \`title_en\` varchar(180) NOT NULL,
    \`subtitle_id\` text,
    \`subtitle_en\` text,
    \`steps_title_id\` varchar(120) NOT NULL,
    \`steps_title_en\` varchar(120) NOT NULL,
    \`button_label_id\` varchar(80) NOT NULL,
    \`button_label_en\` varchar(80) NOT NULL,
    \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_contact_steps\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`contact_id\` int NOT NULL,
    \`text_id\` varchar(220) NOT NULL,
    \`text_en\` varchar(220) NOT NULL,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
    \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_contact_steps_contact\` (\`contact_id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_cta\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`badge_id\` varchar(100) DEFAULT NULL,
    \`badge_en\` varchar(100) DEFAULT NULL,
    \`title_id\` varchar(255) DEFAULT NULL,
    \`title_en\` varchar(255) DEFAULT NULL,
    \`subtitle_id\` text,
    \`subtitle_en\` text,
    \`primary_label_id\` varchar(100) DEFAULT NULL,
    \`primary_label_en\` varchar(100) DEFAULT NULL,
    \`primary_url\` varchar(255) DEFAULT NULL,
    \`secondary_label_id\` varchar(100) DEFAULT NULL,
    \`secondary_label_en\` varchar(100) DEFAULT NULL,
    \`secondary_url\` varchar(255) DEFAULT NULL,
    \`is_active\` tinyint(1) DEFAULT 1,
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_footer\` (
    \`id\` int NOT NULL,
    \`desc_id\` text,
    \`desc_en\` text,
    \`contact_email\` varchar(150) DEFAULT '',
    \`contact_phone\` varchar(50) DEFAULT '',
    \`contact_location_id\` varchar(200) DEFAULT '',
    \`contact_location_en\` varchar(200) DEFAULT '',
    \`copyright_id\` varchar(255) DEFAULT '',
    \`copyright_en\` varchar(255) DEFAULT '',
    \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,

  `CREATE TABLE IF NOT EXISTS \`site_footer_quick_links\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`label_id\` varchar(120) DEFAULT '',
    \`label_en\` varchar(120) DEFAULT '',
    \`url\` varchar(255) DEFAULT '#',
    \`sort_order\` int DEFAULT 0,
    \`is_active\` tinyint(1) DEFAULT 1,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB ${CHARSET}`,
];

const SEEDS = [
  `INSERT IGNORE INTO \`hero\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_navbar\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_about\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_services\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_how_it_works\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_gallery\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_locations\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_partners\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_early_program\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_contact\`
    (\`id\`, \`badge_id\`, \`badge_en\`, \`title_id\`, \`title_en\`,
     \`steps_title_id\`, \`steps_title_en\`, \`button_label_id\`, \`button_label_en\`)
    VALUES (1, 'Kontak', 'Contact', 'Hubungi Kami', 'Contact Us',
            'Langkah', 'Steps', 'Kirim', 'Send')`,
  `INSERT IGNORE INTO \`site_cta\` (\`id\`) VALUES (1)`,
  `INSERT IGNORE INTO \`site_footer\` (\`id\`) VALUES (1)`,
];

async function ensureCmsSchema() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    for (const sql of TABLES) {
      await conn.query(sql);
    }
    for (const sql of SEEDS) {
      await conn.query(sql);
    }
  } finally {
    conn.release();
  }
}

module.exports = { ensureCmsSchema };
