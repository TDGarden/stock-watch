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
  // 港股股票代码前面需要加上hk前缀，如hk09988即可监控阿里巴巴港股
  // 不加前缀的情况下，6开头的代码默认加上sh，其余加上sz
  // 需要查看上证指数，代码为sh000001
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