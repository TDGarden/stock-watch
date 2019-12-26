# stock-watch
Watching your stocks when you are coding. 
VScode插件 | A股 | 港股 | 实时股票数据
好好工作，股票涨停！
GitHub: https://github.com/TDGarden/stock-watch 欢迎PR、star

## Configuration
修改用户配置，添加你所需要监控的股票代码
```
  // 配置需要监控的股票代码
  // 可根据沪市深市分别加上sh、sz前缀，亦可不加
  // 不加前缀的情况下，6开头的代码默认加上sh，其余加上sz
  // 需要查看上证指数，代码为sh000001

  // 港股股票代码前面需要加上hk前缀，如hk09988即可监控阿里巴巴港股
  // 港股指数代码如下
  // 1.工商指数: hkHSC	
  // 2.恒生中国企业指数: hkHSCEI
  // 3.恒生指数: hkHSI
  // 4.红筹指数: hkHSCCI
  // 5.恒生金融分类: hkHSF
  // 6.恒生地产分类: hkHSP
  // 7.恒生公用事业分类: hkHSU
  // 8.标普香港创业板指: hkGEM

  // 美股股票代码前面需要加上US_前缀，如US_AAPL即可监控苹果股票行情
  // 美股指数代码如下
  // 1.道琼斯指数: US_DOWJONES	
  // 2.纳斯达克: US_NASDAQ
  // 3.标普500: US_SP500
  
  "stock-watch.stocks": [
    "000001"
  ],

  // 配置轮询请求最新数据的时间间隔
  "stock-watch.updateInterval": 10000


  // 配置股票涨的颜色，默认为white。为什么不是red，红色像是报错，很刺眼。
  "stock-watch.riseColor": "white"


  // 配置股票跌的颜色，默认为green
  "stock-watch.fallColor": "green"


```