// import node mysql and inquirer packages
let mySQl = require("mysql");
let inquirer = require("inquirer");

// define the Database connection and pass the connection credentials
let myConnection = mySQl.createConnection({
    // server host
    host: "localhost",
    // port on which mysql is hosted, this might be different then 3306(default)
    port: 3307,
    // DB connection user name
    user: "root",
    // DB connection password
    password: "root",
    // Database name
    database: "bamazon"
});

// initialize the database connection
myConnection.connect(function (err) {
    // if any error in getting DB connection then log below
    if (err) throw err;
    // if no error, then call function to display all available products
    displayProduct();
});

// function displayProduct definition. It fetchs the data from DB and display it on terminal
function displayProduct() {
    // prepare query to be executed using available DB connection. This query pull all the available products from products table sorted by ItemID
    let query = "SELECT * FROM products order by item_id";
    // execute mysql query and call callback function after that
    myConnection.query(query, function (err, res) {
        // err contain error data if any error during executing the db query, rep is the result obtained after successfully executing the query
        if (err) throw err;
        else {
            console.log("Welcome to Bamazon: Shopping innovation");
            console.log("Below are the items available for shopping!");
            // loop through the pulled response to display each data
            for (let i = 0; i < res.length; i++) {
                // \x1b[36m change the text color to Blue while console logging it, \x1b[0m- resets it back
                console.log('\x1b[36m ItemID:\x1b[0m ' + res[i].item_id + "\x1b[36m || Product Name:\x1b[0m " + res[i].product_name +
                    "\x1b[36m || Department Category:\x1b[0m " + res[i].department_name + "\x1b[36m || Product Price:\x1b[0m " + res[i].price +
                    "\x1b[36m || Available Quantity:\x1b[0m " + res[i].stock_quantity);
                // console.log('\x1b[36m Hello \x1b[34m Colored \x1b[35m World!');
                // console.log('\x1B[31mHello\x1B[34m World');
                // console.log('\x1b[43mHighlighted');
            }
            start();
        }
    });
}

inquirer
    .prompt([
        {
            name: "itemId",
            type: "input",
            message: "Please enter the product itemID that you would like to buy?",
            validate: function (value) {
                if (isNaN(value) === true) return true;
                return false;
            }
        },
        {
            name: "numOfQuantity",
            type: "input",
            message: "Please provide the quantity needed of this item?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                    console.log("Input validation error");
                }
                return false;
            }
        }
    ])
    .then(function (ans) {
        // console.log(ans.itemId + "  " + ans.numOfQuantity);
        updateStock(ans);
    });
}

function updateStock(ans) {
    myConnection.query("SELECT stock_quantity,price FROM products WHERE ?", {
        item_id: ans.itemId
    }, function (err, res) {
        // console.log(res.length);
        // if no product available for the given item ID
        if (res.length === 0) {
            console.log("No product available in inventory for provided ItemID. Please try another product");
            start();
        }
        // if error in fetching the product details from database
        else if (err) {
            throw err;
            console.log("error in selecting data!")
        }
        // when valid data is pulled
        else {
            let totalPriceOfItem = parseInt(ans.numOfQuantity) * res[0].price;
            // console.log(res);
            // console.log(res[0].stock_quantity + "And" + res[0].price);
            if (parseInt(res[0].stock_quantity) <= 0) {
                console.log("Insufficient quantity!");
                myConnection.end();
            }
            else {
                myConnection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: res[0].stock_quantity - ans.numOfQuantity
                        },
                        {
                            item_id: ans.itemId
                        }
                    ], function (error) {
                        if (error) throw error;
                        console.log("Purchase completed. The unit price of your purchase is $" + res[0].price +
                            "\n Total cost of your purchase is :$" + totalPriceOfItem);
                        start();
                    });
            }
        }
    });
}

function start() {
    inquirer
        .prompt({
            name: "wantToPurchase",
            type: "list",
            message: "Would you like to buy any item from the listed products?",
            choices: ["Yes", "No"]
        })
        .then(function (answer) {
            switch (answer.wantToPurchase) {
                case "Yes":
                    purchaseItem();
                    break;

                case "No":
                    myConnection.end();
                    console.log("Thank you for shopping with Bamazon!");
                    break;
            }
        });
}