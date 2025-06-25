// 云函数入口文件
const cloud = require('wx-server-sdk')
const db = wx.cloud.database();
const _ = db.command;

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
 // const wxContext = cloud.getWXContext()
  try {
    const {
      _openid,
      career_name,
      score,
      gatherNames,                 //数组
      data_language_expression,    //数组
      data_innovation_ability,     //数组
      data_professional_knowledge, //数组
      data_skill_matching,         //数组
      data_logical_thinking,       //数组
      data_stress_resistance       //数组
    } = event

    const dataObjects = {
      'language_expression': data_language_expression,
      'innovation_ability': data_innovation_ability,
      'professional_knowledge': data_professional_knowledge,
      'skill_matching': data_skill_matching,
      'logical_thinking': data_logical_thinking,
      'stress_resistance': data_stress_resistance
    }

    var res_data = {}

    for (let index = 0; index < gatherNames.length; index++) {
      const gatherName = gatherNames[index];
      const data = dataObjects[gatherName];
      data[_openid] = _openid
      
      if (!data) {
        return {
          code: 500,
          message: `无此数据对象: ${gatherName}`
        }
      }

    const res = await db.collection(gatherName).add({
        data: data
      })

      var _id = res._id

      res_data[gatherName] = {
        _id,
        career_name,
        _openid,
        score
      }

    }

        // 查询当前最大自增值
        const maxRes = await db.collection(career_test_list).orderBy('autoIndex', 'desc').get()
        const maxVal = maxRes.data.length > 0 ? maxRes.data[0].autoIndex : 0
    
        // 设置自增值
        autoIndex = maxVal + 1

       await db.collection('career_test_list').add({
          data: {
            autoIndex,
            res_data
          }
      })

    return {
      message: '成功储存',
      updated: res_data
    }

  } catch (error) {
    return {
      code: 500,
      message: '错误：' + error.message,
      data: null
    }
  }
}