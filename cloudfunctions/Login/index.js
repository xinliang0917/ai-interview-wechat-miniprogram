// 云函数入口文件
const cloud = require('wx-server-sdk')
const db = wx.cloud.database();
const _ = db.command;

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const {
      password,
      account,
    } = event

    const res = await db.collection("user").where({
      account: account
    }).get()

    if (res.data.length === 0) {
      return {
        message: '用户不存在',
      }
    } else if (res.data.length > 0) {
      if (res.data.password !== password) {
        return {
          message: '密码错误',
        }
      }
    }

    return {
      message: '登陆成功',
      openid: res.data._openid
    }
  } catch (error) {
    return {
      code: 500,
      message: '错误：' + error.message,
      data: null
    }
  }

}