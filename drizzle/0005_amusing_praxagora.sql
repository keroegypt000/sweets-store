CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`mimeType` varchar(50) DEFAULT 'image/jpeg',
	`fileSize` int,
	`width` int,
	`height` int,
	`altText` text,
	`description` text,
	`usageType` enum('product','category','banner','general') DEFAULT 'general',
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`),
	CONSTRAINT `images_fileKey_unique` UNIQUE(`fileKey`)
);
