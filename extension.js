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
            if(code.toLowerCase().indexOf('us_') > -1){
                return code.toUpperCase();
            }else if(code.indexOf('hk') > -1){
                return code;
            }else{
                return code.toLowerCase().replace('sz', '1').replace('sh', '0');
            }
            
        }else{
            return (code[0] === '6' ? '0' : '1') + code;
        }
    });
}

function getUpdateInterval() {
    const config = vscode.workspace.getConfiguration();
    return config.get('stock-watch.updateInterval');
}

function getItemText(item) {
    return `「${item.name}」${keepTwoDecimal(item.price)} ${item.percent >= 0 ? '📈' : '📉'} ${keepTwoDecimal(item.percent * 100)}%`;
}

function getTooltipText(item) {
    return `【今日行情】\n涨跌：${item.updown}   百分：${keepTwoDecimal(item.percent * 100)}%\n最高：${item.high}   最低：${item.low}\n今开：${item.open}   昨收：${item.yestclose}`;
}

function getItemColor(item) {
    const config = vscode.workspace.getConfiguration();
    const riseColor = config.get('stock-watch.riseColor');
    const fallColor = config.get('stock-watch.fallColor');

    return item.percent >= 0 ? riseColor : fallColor;
}

function fetchAllData() {
    axios.get(`${baseUrl}${stockCodes.join(',')}?callback=a`)
        .then((rep) => {
            try {
                const result = JSON.parse(rep.data.slice(2,-2));
                let data = [];
                Object.keys(result).map(item => {
                    if(!result[item].code){
                        result[item].code = item; //兼容港股美股
                    }
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
            statusBarItems[key].text = getItemText(item);
            statusBarItems[key].color = getItemColor(item);
            statusBarItems[key].tooltip = getTooltipText(item);
        } else {
            statusBarItems[key] = createStatusBarItem(item);
        }
    });
}

function createStatusBarItem(item) {
    const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    barItem.text = getItemText(item);
    barItem.color = getItemColor(item);
    barItem.tooltip = getTooltipText(item);
    barItem.show();
    return barItem;
}

function keepTwoDecimal(num) {
    const config = vscode.workspace.getConfiguration();
    var result = parseFloat(num);
    if (isNaN(result)) {
        return '--';
    }

    var precision = config.get('stock-watch.pricePrecision')
    precision = precision < 0 ? 0 :precision;
    return result.toFixed(precision);
}
