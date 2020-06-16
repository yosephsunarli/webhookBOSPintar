var nodeFetch = require('node-fetch');
var fetch = require('fetch-cookie')(nodeFetch);
var moment = require('moment');
var https = require('https');
var fs = require('fs');
var baseURL = "https://b1demo.beonesolution.com:50001/b1s/v1/";
// SSL
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
global.Headers = fetch.Headers;

async function loginSL() {
    var body = {
        CompanyDB: "DEMOPS",
        UserName: "manager",
        Password: "b1ONE"
    }
    await fetch(baseURL + "Login", {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        xhrFields: {
            'withCredentials': true
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                console.log(moment().format('YYYY-MM-DD h:mm:ss a') + ": ");
                console.log("Login failed");
                console.log(data);
                throw new Error(data);
            }
        })
        .catch(err => {
            throw err;
        });
}

async function getWarehouse(warehouse) {
    let result = await fetch(baseURL + "Warehouses?$filter=contains(WarehouseName,'" + warehouse + "')", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        xhrFields: {
            'withCredentials': true
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                console.log(moment().format('YYYY-MM-DD h:mm:ss a') + ": ");
                console.log("Get Warehouse failed");
                console.log(data);
                throw new Error(data);
            } else {
                // SUCCESSFULY GET WAREHOUSE DATA FROM SAP
                return data;
            }
        })
        .catch(err => {
            throw err;
        });
    return result;
}

async function getStock(item) {
    let result = await fetch(baseURL + "Items?$filter=contains(ItemName,'" + item + "')", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        xhrFields: {
            'withCredentials': true
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.hasOwnProperty("error")) {
                console.log(moment().format('YYYY-MM-DD h:mm:ss a') + ": ");
                console.log("Get Stock failed");
                console.log(data);
                throw new Error(data);
            } else {
                // SUCCESSFULY GET STOCK DATA FROM SAP
                return data;
            }
        })
        .catch(err => {
            throw err;
        });
    return result;
}

exports.webhookFunction = async function(req,res) {
    var warehouse = req.body.queryResult.parameters.WAREHOUSE;
    var item = req.body.queryResult.parameters.item;
    try {
        await loginSL();
        var gudang = await getWarehouse(warehouse);
        var data = await getStock(item);
        var whsData = data.value[0].ItemWarehouseInfoCollection.filter(function(whs) {
			return (whs.WarehouseCode.includes(gudang.value[0].WarehouseCode))
        })
        var jumlah = whsData[0].InStock - whsData[0].Committed + whsData[0].Ordered;
		var result = {
			fulfillmentText: "Jumlah available stock untuk " + item + " di " + gudang.value[0].WarehouseName + " adalah: " + jumlah + " dengan rincian sebagai berikut:\r\nIn Stock: " + whsData[0].InStock + "\r\nCommitted: " + whsData[0].Committed + "\r\nOrdered: " + whsData[0].Ordered + "\r\nApakah ada yang bisa saya bantu lagi?"
        }
        res.json(result);
    } catch (err) {
        console.log(err);
        var result = {
			fulfillmentText: "Tidak dapat terhubung ke SAP Business One."
		}
		res.json(result);
    }    
}