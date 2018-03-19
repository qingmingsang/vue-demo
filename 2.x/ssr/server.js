const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

const { createBundleRenderer } = require('vue-server-renderer')

let ldir = path.resolve(__dirname, 'dist/client/client.html');
const template = fs.readFileSync(ldir, 'utf-8')
const serverBundle = require('./dist/server/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/client/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false, // 推荐将 runInNewContext 选项设置为 false 或 'once'
  template, // （可选）页面模板
  clientManifest // （可选）客户端构建 manifest
})

app.use(express.static('dist/client'));

app.get('/data', (req, res, next) => {
  res.send({
    "code": 1,
    "data": {
      "livePreList": [],
      "liveWodList": [{
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/05/05/183558.90013339.jpg",
        "liveId": 634,
        "liveStatus": 4,
        "startTime": 1494313262000,
        "statistic": 64783,
        "title": "《超凡战队》首映礼发布会",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/05/08/175130.84730904.jpg",
        "liveId": 635,
        "liveStatus": 4,
        "startTime": 1494307635000,
        "statistic": 60474,
        "title": "《毒。诫》首映礼发布会",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/05/04/105659.96592879.jpg",
        "liveId": 632,
        "liveStatus": 4,
        "startTime": 1493974792000,
        "statistic": 95528,
        "title": "《时光玩家说》漫威周边大搜罗",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/24/145810.69089438.jpg",
        "liveId": 628,
        "liveStatus": 4,
        "startTime": 1493369978000,
        "statistic": 309495,
        "title": "《时光玩家说》银河护卫队特辑",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/25/094952.69977973.jpg",
        "liveId": 630,
        "liveStatus": 4,
        "startTime": 1493186515000,
        "statistic": 298599,
        "title": "《拆弹专家》首映礼",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/21/182516.74965602.jpg",
        "liveId": 626,
        "liveStatus": 4,
        "startTime": 1493009461000,
        "statistic": 766879,
        "title": "《记忆大师》全球首映礼",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/21/111007.73905844.jpg",
        "liveId": 623,
        "liveStatus": 4,
        "startTime": 1492929029000,
        "statistic": 229640,
        "title": "《喜欢你》“甜蜜蜜”首映礼发布会",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/19/101417.14887129.jpg",
        "liveId": 622,
        "liveStatus": 4,
        "startTime": 1492837672000,
        "statistic": 524955,
        "title": "《记忆大师》丰台万达广场“记忆迷宫”启动式",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/17/174133.40415342.jpg",
        "liveId": 620,
        "liveStatus": 4,
        "startTime": 1492765191000,
        "statistic": 98698,
        "title": "《时光玩家说》蓝精灵与蓝胖子萌物特辑",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/13/120129.35487357.jpg",
        "liveId": 618,
        "liveStatus": 4,
        "startTime": 1492257715000,
        "statistic": 239993,
        "title": "《西游记：女儿国》“秀之夜”发布会",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/11/152835.27620379.jpg",
        "liveId": 617,
        "liveStatus": 4,
        "startTime": 1492181998000,
        "statistic": 197493,
        "title": "星球大战庆典：星战八专场活动",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/13/153319.67664501.jpg",
        "liveId": 619,
        "liveStatus": 4,
        "startTime": 1492146498000,
        "statistic": 87973,
        "title": "《青禾男高》“校门口见”新闻发布会",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/10/170953.85552490.jpg",
        "liveId": 614,
        "liveStatus": 4,
        "startTime": 1491987581000,
        "statistic": 235831,
        "title": "《时光玩家说》“速激”车库探秘 人气车模炫酷登场",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/11/162902.42940538.jpg",
        "liveId": 613,
        "liveStatus": 4,
        "startTime": 1491901200000,
        "statistic": 166910,
        "title": "周冬雨 张孝全《指甲刀人魔》首映礼现场直击",
        "videoId": 0
      }, {
        "appointStatus": 0,
        "image": "https://imgproxy.mtime.cn/get.ashx?uri=http://img5.mtime.cn/mg/2017/04/07/102003.53869632.jpg",
        "liveId": 612,
        "liveStatus": 4,
        "startTime": 1491719232000,
        "statistic": 88904,
        "title": "《反转人生》有求必应发布会",
        "videoId": 0
      }],
      "livingList": [],
      "myAppointLiveList": []
    },
    "msg": "",
    "showMsg": ""
  })
})

// app.get('*', function (req, res) {
//   res.sendFile(ldir)
// })

// 在服务器处理函数中……
app.get('*', (req, res) => {
  const context = { url: req.url }
  // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
  // 现在我们的服务器与应用程序已经解耦！
  renderer.renderToString(context, (err, html) => {
    // 处理异常……
    //console.log(html);
    res.end(html)
  })
})
app.listen(7000, () => {
  console.log(`Listening on port 7000`);
});


