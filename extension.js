const vscode = require('vscode');
const axios = require('axios');
const baseUrl = 'https://api.money.126.net/data/feed/';
let statusBarItems = {};
let stockCodes = [];
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
    return stocks.map((code) => {
        if(isNaN(code[0])){
            return code.toLowerCase().replace('sz', '1').replace('sh', '0');
        }else{
            return (code[0] === '6' ? '0' : '1') + code;
        }
    });
}

function getUpdateInterval() {
    const config = vscode.workspace.getConfiguration();
    return config.get('stock-watch.updateInterval');
}

function fetchAllData() {
    axios.get(`${baseUrl}${stockCodes.join(',')}?callback=a`)
        .then((rep) => {
            try {
                const result = JSON.parse(rep.data.slice(2,-2));
                let data = [];
                Object.keys(result).map(item => {
                    data.push(result[item])
                })
                displayData(data);
            } catch (error) {
                
            }

        }, (error) => {
            console.error(error);
        }).catch((error) => {
            console.error(error);
        });
}

function displayData(data) {
    data.map((item) => {
        const key = item.code;
        if (statusBarItems[key]) {
            statusBarItems[key].text = `「${item.name}」${keepTwoDecimal(item.price)} ${item.percent > 0 ? '📈' : '📉'} ${keepTwoDecimal(item.percent * 100)}%`;
        } else {
            statusBarItems[key] = createStatusBarItem(item);
        }
    });
}

function createStatusBarItem(item) {
    const message = `「${item.name}」${keepTwoDecimal(item.price)} ${item.percent > 0 ? '📈' : '📉'} ${keepTwoDecimal(item.percent * 100)}%`;
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
