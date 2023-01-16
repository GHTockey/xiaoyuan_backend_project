'use strict';
const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
// 用于异步操作文件流
const awaitWriteStream = require("await-stream-ready").write;
// 用于关闭管道流
const sendToWormhole = require("stream-wormhole");
const { strToArr } = require('../utils');;

module.exports = class OtherController extends Controller {
    async searchArticle() {
        const { ctx } = this;
        let { value } = ctx.request.body;
        if (!value) return ctx.body = { code: 400, message: '请传入关键词' };

        let res = await ctx.app.mysql.query(`
                SELECT * FROM articles 
                WHERE name LIKE "%${value}%" 
                OR title LIKE "%${value}%";
        `);
        strToArr(res); // 字符串'[]'转数组
        ctx.body = {
            code: 200,
            message: '搜索完成',
            data: res
        };
    };

    // 文件上传
    async fileUpload() {
        const { ctx } = this;
        let fileStream;
        try {
            try {
                fileStream = await this.ctx.getFileStream();
            } catch (err) {
                return ctx.body = { code: 400, message: '没有传入文件或者不支持的文件格式' };

            };
            let { type } = fileStream.fields;
            type = type ? type : 'other';

            // 判断文件夹不存在 
            if (!fs.existsSync(`app/public/imgs/${type}`)) {
                // 创建文件夹
                fs.mkdirSync(`app/public/imgs/${type}`)
            };
            // 生成随机数
            let randomNum = String(+new Date) + String(Math.random()).slice(-5);
            // 创建可写流
            let ws = fs.createWriteStream(`app/public/imgs/${type}/${randomNum + fileStream.filename}`);
            // 写入数据
            try {
                await awaitWriteStream(fileStream.pipe(ws));
            } catch (error) {
                // 如果出现错误则关闭管道流
                await sendToWormhole(fileStream);
                throw error;
            };
            let { size } = fs.statSync(`app/public/imgs/${type}/${randomNum + fileStream.filename}`);
            this.ctx.body = {
                message: '上传完成',
                code: 200,
                data: {
                    filename: fileStream.filename,
                    url: `https://api.tockey.cn/public/imgs/${type}/${randomNum + fileStream.filename}`,
                    size: `${Math.floor(size / 1024 / 1024 * 100) / 100}MB`
                }
            }
        } catch (error) {
            ctx.body = { code: 400, message: "捕获到错误：" + error };
        };
    };

    // 获取置顶文章
    async getToppingArticle() {
        const { ctx } = this;
        try {
            // 校验参数
            let { type } = ctx.query;
            if (!type) return ctx.body = { code: 400, message: '参数缺失: type' };

            // 校验置顶文章数
            let articles = await ctx.app.mysql.select('articles', { where: { type, is_topping: 1 } });
            if (!articles.length) return ctx.body = { code: 400, message: `分类：${type} 下没有置顶文章` };
            strToArr(articles);
            ctx.body = {
                code: 200,
                message: '获取成功',
                data: articles
            };
        } catch (error) {
            ctx.body = { code: 400, message: "捕获到错误：" + error }
        };
    };

    // webhook
    async ttt() {
        console.log('接收到响应', this.ctx.request.body);
        this.ctx.body = { "ec": 200, "em": "" }
    };
};