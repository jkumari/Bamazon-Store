// import node mysql and inquirer packages
let mySQl = require("mysql");
let inquirer = require("inquirer");

const lowInvThreshold = 50;
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
    start();
});

function start() {
    inquirer
        .prompt({
            name: "managersActionItem",
            type: "list",
            message: "Welcome to manager's portal. Please select from the options below for next action.\n",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "exit"]
        })
        .then(function (answer) {
            switch (answer.managersActionItem) {
                case "View Products for Sale":
                    viewProductsForSale();
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    addToInventory();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                case "exit":
                    myConnection.end();
                    break;
            }
        });
}

function viewProductsForSale() {
    let query = "SELECT * FROM products";
    myConnection.query(query, function (err, res) {
        if (err) {
            throw err;
        }
        else {
            if (res.length > 0) {
                console.log("Welcome to Bamazon: Shopping innovation");
                console.log("Below are the items available for sale!");
                displayData(res);
                start();
            }
            else {
                console.log("No product available in inventory for sale. Please add to inventory/add new products to countinue business\n");
                start();
            }
        }
    });

}

function viewLowInventory() {
    let query = "SELECT * FROM products p WHERE p.stock_quantity <" + lowInvThreshold;
    myConnection.query(query, function (err, res) {
        if (err) throw err;
        else {
            if (res.length > 0) {
                console.log("Welcome to Bamazon: Shopping innovation");
                console.log("Below are the items available for sale!");
                displayData(res);
                start();
            }
            else {
                console.log("We are stocked up! All products have enough inventory.\n")
                start();
            }
        }
    });

}

function addToInventory() {
    let questions = [
        {
            message: "Please enter the itemId which you want to add to inventory?",
            type: "input",
            name: "additemId",
            validate: function validateAdditemId(name) {
                return name !== '';
            }
        },
        {
            message: "Please provide the number of items that will be added to inventory for above product?",
            type: "input",
            name: "numOfItems",
            validate: function validateNumOfItems(name) {
                var reg = /^\d+$/;
                return reg.test(name) || "It should be a number!";
            }
        }];
    inquirer
        .prompt(questions)
        .then(function (answer) {
            updateInventory(answer);
        });
}

function addNewProduct() {
    console.log("Add new Product");
    console.log('>>>>>>Adding New Product<<<<<<');
    console.log('Please provide required details');
    let questionSet =
        [
            {
                message: "Please provide ItemID",
                type: "input",
                name: "itemID",
                validate: function validateAdditemId(name) {
                    return name !== '';
                }
            },
            {
                message: "Please provide Product Name",
                type: "input",
                name: "productName",
                validate: function validateAdditemId(name) {
                    return name !== '';
                }
            },
            {
                message: "Please provide Product's department",
                type: "input",
                name: "departmentName",
                validate: function validateAdditemId(name) {
                    return name !== '';
                }
            },
            {
                message: "Please provide Product's price",
                type: "input",
                name: "prodPrice",
                validate: function (value) {
                    if (isNaN(value) === false) { return true; }
                    else { return false; }
                }
            },
            {
                message: "Please provide Product stock quantity",
                type: "input",
                name: "stockQuantity",
                validate: function validateNumOfItems(name) {
                    var reg = /^\d+$/;
                    return reg.test(name) || "It should be a number!";
                }
            }];
    inquirer
        .prompt(questionSet)
        .then(function (answer) {
            InsetNewItemToTable(answer);
        });
}

function InsetNewItemToTable(answer) {

    console.log(answer);

    myConnection.query("INSERT INTO products SET ?", { 
        item_id: answer.itemID,
        product_name: answer.productName,
        department_name: answer.departmentName,
        price: answer.prodPrice,
        stock_quantity: answer.stockQuantity
    }, function (err, res) {
        if (err) throw err;
        else {
            console.log(`One new item added to inventory with itemId ${answer.itemID}`);
            start();
        }
    });
}
function displayData(res) {
    for (let i = 0; i < res.length; i++) {
        console.log('\x1b[36m ItemID:\x1b[0m ' + res[i].item_id +
            "\x1b[36m || Product Name:\x1b[0m " + res[i].product_name +
            "\x1b[36m || Product Price:\x1b[0m " + res[i].price +
            "\x1b[36m || Available Quantity:\x1b[0m " + res[i].stock_quantity);
    }
}

function updateInventory(answer) {
    console.log(answer);
    let query1 = "select * from bamazon.products where item_id =?";
    let query2 = "UPDATE products set ? WHERE ?";
    myConnection.query(query1, [answer.additemId], function (err, res) {
        console.log(res);
        console.log(res[0].stock_quantity);
        if (err) throw err;
        else if (res.length === 0) {
            console.log(`No product found for provided itemID  ${answer.additemId}`);
            start();
        }
        else {
            console.log("res", res[0].stock_quantity);
            console.log("res", parseInt(answer.numOfItems));
            console.log(res[0].stock_quantity + parseInt(answer.numOfItems));
            myConnection.query(query2, [{ stock_quantity: res[0].stock_quantity + parseInt(answer.numOfItems) }, { item_id: answer.additemId }], function (err, res) {
                console.log(res);
                if (err) throw err;
                else {
                    console.log(`Inventory updated successfully for itemID ${answer.additemId}`);
                    start();
                }
            });
        }

    });

}