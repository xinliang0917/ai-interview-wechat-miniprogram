// 云函数入口文件
const cloud = require('wx-server-sdk')
const db = wx.cloud.database();
const _ = db.command;

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _openid } = event
  const User = ['university', 'job_intention', 'work_experience', 'award', 'advantages']
  const data = {}
  try {
    const res = await db.collection("user_info").where({
      _openid: _openid
    }).get()

    User.forEach(item => {
      if (event[item] !== undefined) {
        data[item] = event[item]
      }
    })

    if (res.data.length === 0) {
      await db.collection("user_info").add({
        data:data
      })
      return {
        message: '添加成功',
      }
    }
    else if (res.data.length > 0) {
     await db.collection("user_info").where({
        _openid: data._openid
      }).update({
        data: data
      })
      return {
        message: '更新成功',
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '错误：' + error.message,
      data: null
    }
  }
}