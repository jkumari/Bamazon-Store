#Drop database if it pre-exist 
DROP DATABASE IF EXISTS bamazon;

#Create new database
CREATE DATABASE bamazon;
# Use the newly created database
USE bamazon;
#DROP TABLE bamazon.products 

#Script to create table
   CREATE TABLE bamazon.products (
  item_id VARCHAR(20) UNIQUE NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(100)  NULL,
  price DECIMAL(10,4),
  stock_quantity INT(10),
  PRIMARY KEY (item_id)
);

SELECT * FROM bamazon.products;