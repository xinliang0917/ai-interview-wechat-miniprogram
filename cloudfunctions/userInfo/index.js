// 云函数入口文件
const cloud = require('wx-server-sdk')
const db = wx.cloud.database();
const _ = db.command;

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    _openid
  } = event
  try {
    const res = await db.collection("user_info").where({
      _openid: _openid
    }).get()

    if (res.data.length === 0) {
      return {
        code: 500,
        message: '该用户暂无记录',
        data: null
      }
    }
    return {
      message: '获取成功',
      data: res.data
    }
  } catch (error) {
    return {
      code: 500,
      message: '错误：' + error.message,
      data: null
    }
  }

}