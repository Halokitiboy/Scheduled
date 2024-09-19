require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");

// 飞书 Webhook URL
const FEISHU_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/78ada885-3fca-42d7-95a8-87e7a68a66f3';
// 抖音热点API
const DOUYIN_HOT_API = "https://tenapi.cn/v2/douyinhot";
// 百度热点API
const BAIDU_HOT_API = "https://tenapi.cn/v2/baiduhot";
// 历史上的今天
const HISTORY_API = "https://tenapi.cn/v2/history";
// // 飞书 Webhook URL
// const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;
// // 抖音热点API
// const DOUYIN_HOT_API = process.env.DOUYIN_HOT_API;
// // 百度热点API
// const BAIDU_HOT_API = process.env.BAIDU_HOT_API;
// // 历史上的今天
// const HISTORY_API = process.env.HISTORY_API;
async function formatDataForFeishu() {
  let msg1 = await getAndSendDouyinHot();
  let msg2 = await getAndSendBaiduHot();
  let msg3 = await getHistoryOfToday();
  let douyin_col = [
    {
      tag: "markdown",
      content: msg1.slice(0, 10).reduce((pre, res) => {
        pre += `<link icon='chat_outlined' url='${res.url}'>${res.name}</link>\n`;
        return pre;
      }, ""),
      text_align: "left",
      text_size: "normal",
    },
  ];
  let baidu_col = [
    {
      tag: "markdown",
      content: msg2.slice(0, 10).reduce((pre, res) => {
        pre += `<link icon='chat_outlined' url='${res.url}'>${res.name}</link>\n`;
        return pre;
      }, ""),
      text_align: "left",
      text_size: "normal",
    },
  ];
  const currentHour = new Date().getHours();
  let history =
    currentHour < 10
      ? [
          {
            tag: "markdown",
            content:
              `** 🥰历史上的今天 **\n\n` +
              msg3.list.slice(0, 10).reduce((pre, res) => {
                pre += `<link icon='chat_outlined' url='${res.url}'>${res.year}年 ${res.title}</link>\n`;
                return pre;
              }, ""),
            text_align: "left",
            text_size: "normal",
          },
        ]
      : [];
  return {
    msg_type: "interactive",
    card: {
      config: {
        update_multi: true,
      },
      i18n_elements: {
        zh_cn: [
          {
            tag: "column_set",
            flex_mode: "none",
            background_style: "default",
            horizontal_spacing: "8px",
            horizontal_align: "left",
            columns: [
              {
                tag: "column",
                width: "weighted",
                vertical_align: "top",
                vertical_spacing: "8px",
                background_style: "default",
                elements: [
                  {
                    tag: "markdown",
                    content: "**🗳抖音热搜榜：**",
                    text_align: "left",
                    text_size: "normal",
                  },
                ],
                weight: 1,
              },
              {
                tag: "column",
                width: "weighted",
                vertical_align: "top",
                vertical_spacing: "8px",
                background_style: "default",
                elements: [
                  {
                    tag: "markdown",
                    content: "**📝百度热搜榜：**",
                    text_align: "left",
                    text_size: "normal",
                  },
                ],
                weight: 1,
              },
            ],
            margin: "16px 0px 0px 0px",
          },
          {
            tag: "column_set",
            flex_mode: "none",
            background_style: "default",
            horizontal_spacing: "8px",
            horizontal_align: "left",
            columns: [
              {
                tag: "column",
                width: "weighted",
                vertical_align: "top",
                vertical_spacing: "8px",
                background_style: "default",
                elements: [
                  {
                    tag: "column_set",
                    flex_mode: "none",
                    background_style: "default",
                    horizontal_spacing: "8px",
                    horizontal_align: "left",
                    columns: [
                      {
                        tag: "column",
                        width: "weighted",
                        vertical_align: "top",
                        vertical_spacing: "8px",
                        background_style: "default",
                        elements: douyin_col,
                        weight: 1,
                      },
                      {
                        tag: "column",
                        width: "weighted",
                        vertical_align: "top",
                        vertical_spacing: "8px",
                        background_style: "default",
                        elements: baidu_col,
                        weight: 1,
                      },
                    ],
                    margin: "0px 0px 0px 0px",
                  },
                ],
                weight: 1,
              },
            ],
            margin: "16px 0px 0px 0px",
          },
          {
            tag: "hr",
          },
          {
            tag: "column_set",
            flex_mode: "none",
            background_style: "default",
            horizontal_spacing: "8px",
            horizontal_align: "left",
            columns: [
              {
                tag: "column",
                width: "weighted",
                vertical_align: "top",
                elements: history,
                weight: 1,
              },
            ],
            margin: "16px 0px 0px 0px",
          },
        ],
      },
      i18n_header: {
        zh_cn: {
          title: {
            tag: "plain_text",
            content: `今日News`,
          },
          subtitle: {
            tag: "plain_text",
            content: `${msg3.today}`,
          },
          template: "blue",
        },
      },
    },
  };
}

// 发送消息到飞书
async function sendToFeishu(message) {
  try {
    await axios.post(FEISHU_WEBHOOK_URL, message);
    console.log("消息已成功发送到飞书");
  } catch (error) {
    console.error("发送消息到飞书时出错:", error);
  }
}

// 获取抖音热点数据并发送到飞书
async function getAndSendDouyinHot() {
  try {
    const response = await axios.get(DOUYIN_HOT_API);
    return response.data.data;
  } catch (error) {
    console.error("获取或处理抖音热点数据时出错:", error);
  }
}
// 获取百度热点数据并发送到飞书
async function getAndSendBaiduHot() {
  try {
    const response = await axios.get(BAIDU_HOT_API);
    return response.data.data;
  } catch (error) {
    console.error("获取或处理抖音热点数据时出错:", error);
  }
}
// 获取历史上的今天
async function getHistoryOfToday() {
  try {
    const response = await axios.get(HISTORY_API);
    return response.data.data;
  } catch (error) {
    console.error("获取或处理抖音热点数据时出错:", error);
  }
}
// 定时器
// cron.schedule(
//   "0 9-19/1 * * *",
//   () => {
//     const currentHour = new Date().getHours();
//     if (currentHour >= 9 && currentHour <= 19) {
//       formatDataForFeishu().then((msg) => {
//         sendToFeishu(msg);
//       });
//     }
//   },
//   {
//     timezone: "Asia/Shanghai",
//   }
// );
formatDataForFeishu().then((msg) => {
  sendToFeishu(msg);
});
console.log("定时器已启动，每天9点到19点之间每小时执行一次任务。");
