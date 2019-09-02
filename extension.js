const vscode = require('vscode');
const axios = require('axios');
const baseUrl = 'https://gupiao.baidu.com/api/rails/stockbasicbatch?stock_code=';
let statusBarItems = {};
let stockCodes = {}; // code: 0 ? open_price: base_price  
let updateInterval = 10000;
let timer = null;

function activate(context) {
    init();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigChange));
}
exports.activate = activate;

function deactivate() {

}
exports.deactivate = deactivate;

function init(){
    stockCodes = getStockCodes();
    updateInterval = getUpdateInterval();
    fetchAllData();
    timer = setInterval(fetchAllData, updateInterval);
}

function handleConfigChange(){
    timer && clearInterval(timer);
    const codes = getStockCodes();
    Object.keys(statusBarItems).forEach((item) => {
        if(codes.indexOf(item) === -1){
            statusBarItems[item].hide();
            statusBarItems[item].dispose();
            delete statusBarItems[item];
        }
    });
    init();
}

function getStockCodes() {
    const config = vscode.workspace.getConfiguration();
    const stocks = config.get('stock-watch.stocks');
    let new_stocks = {}
    if (typeof stocks === 'object') {
        (stocks instanceof Array ? stocks : Object.keys(stocks)).forEach(code=>{
            let value = parseFloat(stocks[code])||0
            if(!isNaN(parseInt(code[0]))){
                code = (code[0] === '6' ? 'sh' : 'sz') + code;
            }
            new_stocks[code] = value
        })
    }
    return new_stocks
}

function getUpdateInterval() {
    const config = vscode.workspace.getConfiguration();
    return config.get('stock-watch.updateInterval');
}

function fetchAllData() {
    axios.get(`${baseUrl}${Object.keys(stockCodes).join(',')}`)
        .then((rep) => {
            const result = rep.data;
            if (result.errorNo === 0 && result.data.length) {
                displayData(result.data);
            }
        }, (error) => {
            console.error(error);
        }).catch((error) => {
            console.error(error);
        });
}

function displayData(data) {
    data.map((item) => {
        const key = item.exchange + item.stockCode;
        if (stockCodes[key] > 0) {
            item.netChangeRatio = keepTwoDecimal((item.close - stockCodes[key]) / stockCodes[key] * 100)
        }
        if (statusBarItems[key]) {
            statusBarItems[key].text = `「${item.stockName}」${keepTwoDecimal(item.close)} ${item.netChangeRatio > 0 ? '📈' : '📉'} ${keepTwoDecimal(item.netChangeRatio)}%`;
        } else {
            statusBarItems[key] = createStatusBarItem(item);
        }
    });
}

function createStatusBarItem(item) {
    const message = `「${item.stockName}」${keepTwoDecimal(item.close)} ${item.netChangeRatio > 0 ? '📈' : '📉'} ${keepTwoDecimal(item.netChangeRatio)}%`;
    const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    barItem.text = message;
    barItem.show();
    return barItem;
}

function keepTwoDecimal(num) {
    var result = parseFloat(num);
    if (isNaN(result)) {
        return '--';
    }
    return result.toFixed(2);
}
