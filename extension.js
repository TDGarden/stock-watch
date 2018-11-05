const vscode = require('vscode');
const axios = require('axios');
const baseUrl = 'https://gupiao.baidu.com/api/rails/stockbasicbatch?stock_code=';
let statusBarItems = {};

function activate() {
    const config = vscode.workspace.getConfiguration();
    const updateInterval = config.get('stock-watch.updateInterval');
    fetchAllData();
    setInterval(fetchAllData, updateInterval);
}
exports.activate = activate;

function deactivate() {

}
exports.deactivate = deactivate;

function getStockCodes() {
    const config = vscode.workspace.getConfiguration();
    const stocks = config.get('stock-watch.stocks');
    return stocks.map((code) => {
        return (code[0] === '6' ? 'sh' : 'sz') + code;
    });
}

function fetchAllData() {
    const codes = getStockCodes();
    axios.get(`${baseUrl}${codes.join(',')}`)
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