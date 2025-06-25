// 云函数入口文件
const cloud = require('wx-server-sdk')
import {
  CozeAPI
} from '@coze/api';
import axios from 'axios';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const token = 'cztei_qhTTsccGA4EQA4HCF981BisxuicbkmHsTU30MpVr0SnyTK9TiUN1npgzyTCssA3G9'
  const API = '' //未定
  if (!token || !API) {
    return {
      code: 500,
      message: '缺少必要的API配置信息'
    };
  }

  try {
    // 接收前端传入的用户消息（动态参数）要传输的文本
    const userMessage = event.message || '';
    if (!userMessage.trim()) {
      return {
        code: 500,
        message: '用户消息不能为空'
      };
    }

    const response = await axios({
      method: 'POST',
      url: API,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        model: "coze",
        messages: [{
          role: "user",
          context: userMessage
        }],
        stream: true
      },
      responseType: 'stream'
    })

    // 3. 解析流式数据并拼接回复
    let fullReply = '';
    for await (const chunk of response.data) {
      if (!chunk) continue;
      try {
        // 解析JSON片段（不同API格式可能不同，需按文档调整）
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.substring(6).trim();
            if (jsonData === '[DONE]') continue; // OpenAI流式结束标记
            const parsed = JSON.parse(jsonData);
            const delta = parsed.choices[0]?.delta?.content || '';
            fullReply += delta;
          }
        }
      } catch (err) {
        console.error('流式解析错误:', err);
      }
    }

    return {
      code: 500,
      data: {
        reply: fullReply
      }
    };

  } catch (error) {
    console.error('API调用失败:', error);
    return {
      code: 500,
      message: error.message || '智能体接口调用异常'
    };
  }
}