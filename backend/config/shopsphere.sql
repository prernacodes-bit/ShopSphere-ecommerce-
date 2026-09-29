-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: shopsphere
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (31,3,13,1,'2026-09-29 08:30:23');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Electronics','Mobiles, laptops and electronic items','2026-09-23 17:43:59'),(2,'Clothing','Men and women clothing','2026-09-23 17:43:59'),(3,'Shoes','All types of footwear','2026-09-23 17:43:59'),(4,'Books','Books and educational materials','2026-09-23 17:43:59'),(5,'Home Appliances','Appliances for home','2026-09-24 12:58:16');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,2,2,69999.00),(2,2,2,2,69999.00),(3,3,2,3,69999.00),(4,4,2,4,69999.00),(5,5,2,6,69999.00),(6,6,4,1,55999.00),(7,6,9,1,2299.00),(8,6,11,1,699.00),(9,6,13,18,1299.00),(10,7,3,6,69999.00),(11,8,3,4,69999.00),(12,9,12,10,3499.00),(13,10,12,2,3499.00),(14,10,14,3,5000.00),(15,11,11,3,699.00),(16,12,9,1,2299.00),(17,12,11,1,699.00),(18,13,11,1,699.00),(19,14,11,1,699.00),(20,15,11,1,699.00),(21,16,4,1,55999.00),(22,16,8,1,1999.00),(23,16,13,5,1299.00),(24,17,13,3,1299.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,14,'Processing','2026-09-27 06:25:55'),(2,14,'Shipped','2026-09-27 06:53:25'),(3,14,'Processing','2026-09-27 06:53:36'),(4,14,'Delivered','2026-09-27 07:03:55'),(5,13,'Processing','2026-09-27 07:04:29'),(6,13,'Shipped','2026-09-27 07:04:39'),(7,10,'Delivered','2026-09-27 07:05:03'),(8,14,'Cancelled','2026-09-28 11:18:33'),(9,15,'Pending','2026-09-28 15:47:12'),(10,16,'Pending','2026-09-29 08:26:12'),(11,17,'Pending','2026-09-29 08:41:46');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,139998.00,'Confirmed','2026-09-24 15:23:26'),(2,1,139998.00,'Pending','2026-09-24 15:28:56'),(3,2,209997.00,'Pending','2026-09-24 17:20:08'),(4,2,279996.00,'Pending','2026-09-24 17:43:53'),(5,2,419994.00,'Pending','2026-09-24 18:41:03'),(6,2,82379.00,'Pending','2026-09-25 13:45:09'),(7,2,419994.00,'Pending','2026-09-25 13:45:56'),(8,2,279996.00,'Pending','2026-09-25 13:46:34'),(9,2,34990.00,'Shipped','2026-09-25 16:58:55'),(10,2,21998.00,'Delivered','2026-09-26 15:14:51'),(11,2,2097.00,'Pending','2026-09-26 16:07:55'),(12,4,2998.00,'Pending','2026-09-26 18:11:19'),(13,2,699.00,'Shipped','2026-09-27 05:03:00'),(14,2,699.00,'Cancelled','2026-09-27 05:29:25'),(15,2,699.00,'Pending','2026-09-28 15:47:12'),(16,2,64493.00,'Pending','2026-09-29 08:26:12'),(17,2,3897.00,'Pending','2026-09-29 08:41:46');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `image_url` varchar(500) DEFAULT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deal` tinyint(1) DEFAULT '0',
  `is_featured_deal` tinyint(1) DEFAULT '0',
  `is_current_deal` tinyint(1) DEFAULT '0',
  `deal_type` enum('none','featured','current','both') NOT NULL DEFAULT 'none',
  `mrp` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `deal_title` varchar(150) DEFAULT NULL,
  `offer_text` varchar(255) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `deal_stock` int DEFAULT NULL,
  `deal_start_at` datetime DEFAULT NULL,
  `deal_end_at` datetime DEFAULT NULL,
  `deal_active` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Samsung Galaxy S24','Samsung Galaxy S24 smartphone',69999.00,4.50,15,'https://placehold.co/600x600/png?text=Samsung+Galaxy+S24',1,'2026-09-24 14:05:02',0,0,0,'current',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(3,'iPhone 15','Latest Apple smartphone with powerful performance and excellent camera.',69999.00,4.70,0,'https://images.unsplash.com/photo-1696446701796-da61225697cc',1,'2026-09-25 06:39:42',0,0,0,'current',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(4,'Dell Laptop','Powerful laptop suitable for work, study and entertainment.',55999.00,4.50,6,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',1,'2026-09-25 06:39:42',0,0,0,'none',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(5,'Wireless Headphones','Comfortable wireless headphones with clear sound quality.',2499.00,4.40,20,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',1,'2026-09-25 06:39:42',0,0,0,'current',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(6,'Cotton T-Shirt','Comfortable cotton t-shirt for everyday wear.',799.00,4.20,30,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',2,'2026-09-25 06:39:42',0,0,0,'current',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(7,'Men Jeans','Stylish and comfortable regular fit jeans.',1499.00,4.30,25,'https://images.unsplash.com/photo-1542272604-787c3835535d',2,'2026-09-25 06:39:42',0,0,0,'current',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(8,'Running Shoes','Lightweight running shoes designed for daily workouts.',1999.00,4.50,19,'https://images.unsplash.com/photo-1542291026-7eec264c27ff',3,'2026-09-25 06:39:42',0,0,0,'featured',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(9,'Casual Sneakers','Comfortable sneakers for casual everyday use.',2299.00,4.40,13,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',3,'2026-09-25 06:39:42',0,0,0,'featured',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(10,'The Alchemist','A popular inspirational novel by Paulo Coelho.',399.00,4.60,50,'https://images.unsplash.com/photo-1544947950-fa07a98d237f',4,'2026-09-25 06:39:42',0,0,0,'featured',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(11,'Clean Code','A practical book about writing clean and maintainable software.',699.00,4.80,17,'https://images.unsplash.com/photo-1532012197267-da84d127e765',4,'2026-09-25 06:39:42',0,0,0,'featured',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0),(12,'Mixer Grinder','Powerful mixer grinder for everyday kitchen use.',3499.00,4.30,0,'https://images.unsplash.com/photo-1570222094114-d054a817e56b',5,'2026-09-25 06:39:42',0,0,0,'featured',13.00,0.24,'mega','get 20%off','meg20',0,'2026-09-29 13:58:00','2026-10-08 13:59:00',1),(13,'Electric Kettle','Fast boiling electric kettle for home and office.',1299.00,5.00,1,'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5',5,'2026-09-25 06:39:42',0,0,0,'current',7.00,0.14,'mega','20%','meg20',0,'2026-09-29 12:07:00','2026-10-07 12:07:00',1),(14,'ppp','...',5000.00,1.40,0,'https://images.unsplash.com/photo-1523275335684-37898b6baf30',5,'2026-09-26 12:17:21',0,0,0,'featured',NULL,0.00,NULL,NULL,NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User','test@gmail.com','$2b$10$uMFqDxS2au.dYKDnhAPhfOETQugZ3TCK237uWRA2x8ILOOwq8.pRq','user','2026-09-22 12:49:13'),(2,'Test User','test@shopsphere.com','$2b$10$oV7P2e2k9871Y2IRmuhHguHRfaOk1eWvQ93ag0klf7dzUjDjbfx1e','user','2026-09-24 16:59:59'),(3,'Admin User','Admin@shopsphere.com','$2b$10$weEfZ9AxHK353Uchi.wIeOAPxLiJay5vsYtd6h5bVrQ/7WYWQd.Oq','admin','2026-09-26 05:56:53'),(4,'prerna','prernagpatil106@gmail.com','$2b$10$p1mCn7gF/RYCNJ/68MEf2eFMQGZpFWXCU232dcNwyoa3X05g82K3C','user','2026-09-26 16:24:26'),(5,'Prerna Ganesh Patil','patilprerna.com@gmil.com','$2b$10$V8qDBlASM5UuU34XJPt1Y.B.DS2Otun9iHFJ455Nn.EBp7YN4SeKu','user','2026-09-28 13:18:45'),(6,'prerna','patilprerna.com@gmail.com','$2b$10$7rirUZWMGNgkpsLITQtZdemdNgNfIKZj/tZXUwJL.66NFeD11RvjS','user','2026-09-28 13:29:09'),(7,'prerna','prerna.patil10603@gmail.com','$2b$10$izuGfIJsCCEnkLt9PAPAceIYeY59r3/vT4n8yl67xFSOsAw138tqW','user','2026-09-28 13:51:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,4,14,'2026-09-26 17:53:02'),(2,4,13,'2026-09-26 17:59:09'),(3,4,11,'2026-09-26 17:59:13'),(6,2,11,'2026-09-27 05:29:59'),(7,2,4,'2026-09-28 15:24:20'),(8,2,5,'2026-09-28 15:24:26'),(9,2,6,'2026-09-28 15:24:30');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29 19:00:09
