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

  try {
    const {
      password,
      account,
      nickname,
      pic,
      _openid
    } = event
    // 查询用户是否存在
    const res = await db.collection("user").where({
      account: account,
      _openid: _openid
    }).get()

    // 如果用户已存在，返回错误信息
    if (res.data.length > 0) {
      return {
        message: '用户已存在',
      }
    }

    await db.collection("user").add({
      data: {
        _openid: _openid,
        password: password,
        account: account,
        nickname: nickname,
        pic: pic
      }
    })

    return {
      message: '注册成功',
    }

  } catch (error) {
    return {
      code: 500,
      message: '错误：' + error.message,
      data: null
    }
  }
}