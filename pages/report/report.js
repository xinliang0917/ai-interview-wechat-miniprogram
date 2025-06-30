Page({
    data: {
        currentQuestion: 1,
        totalQuestions: 16,
        progressWidth: 0,
        countdown: '24:00:00',
        questions: [],
        fileUploaded: false, // 标记是否已上传文件
        fileInfo: null // 存储已上传文件信息
    },

    onLoad() {
        this.initQuestions();
        this.updateProgress();
        this.start24hCountdown();
    },

    initQuestions() {
        this.setData({
            questions: [
                '问题1: 1+1=？',
                '问题2: 你为什么会喜欢这个职业？',
                '问题3: 简述你最成功的一次项目经历。',
                '问题4: 你理想中的工作环境是怎样的？',
                '问题5: 你如何看待人工智能对本行业的影响？',
                '问题6: 你最大的优点和缺点分别是什么？',
                '问题7: 未来5年你的职业规划是什么？',
                '问题8: 你最喜欢的一本书是什么，为什么？',
                '问题9: 你如何平衡工作和生活？',
                '问题10: 你有什么特别的爱好或特长？',
                '问题11: 你如何保持学习和成长的状态？',
                '问题12: 如果工作中与同事发生冲突，你会怎么处理？',
                '问题13: 你对加班的看法是什么？',
                '问题14: 你曾经犯过的最大错误是什么，从中学到了什么？',
                '问题15: 你如何看待团队合作和个人能力的关系？',
                '问题16: 你对我们公司有多少了解？'
            ]
        });
    },

    updateProgress() {
        const width = (this.data.currentQuestion / this.data.totalQuestions) * 100;
        this.setData({ progressWidth: width + '%' });
    },

    start24hCountdown() {
        let totalSeconds = 24 * 60 * 60;
        const timer = setInterval(() => {
            totalSeconds--;
            if (totalSeconds < 0) {
                clearInterval(timer);
                return;
            }
            const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            this.setData({
                countdown: `${hours}:${minutes}:${seconds}`
            });
        }, 1000);
    },

    prevQuestion() {
        if (this.data.currentQuestion === 1) {
            wx.showToast({ title: '已是第一题', icon: 'none' });
            return;
        }
        // 允许直接返回上一题，【不】重置文件上传状态
        this.setData({ 
            currentQuestion: this.data.currentQuestion - 1,
            // fileUploaded: false,
            // fileInfo: null
        }, () => {
            this.updateProgress();
        });
    },

    nextQuestion() {
        // 检查是否已上传文件
        if (!this.data.fileUploaded) {
            wx.showToast({ title: '请先上传文件', icon: 'none' });
            return;
        }

        if (this.data.currentQuestion === this.data.totalQuestions) {
            wx.showToast({ title: '已是最后一题', icon: 'none' });
            return;
        }
        
        // 进入下一题，【不】重置文件上传状态
        this.setData({ 
            currentQuestion: this.data.currentQuestion + 1,
            // fileUploaded: false,
            // fileInfo: null
        }, () => {
            this.updateProgress();
        });
    },

    uploadFile() {
        wx.chooseMessageFile({
            count: 1,
            type: 'all',
            success: res => {
                const file = res.tempFiles[0];
                console.log('选择的文件:', file);
                
                this.setData({
                    fileInfo: file,
                    fileUploaded: true // 标记文件已上传
                });

                wx.uploadFile({
                    url: 'https://your-server/upload',
                    filePath: file.path,
                    name: 'file',
                    formData: { user: 'demo-user' },
                    success: uploadRes => {
                        console.log('上传成功:', uploadRes);
                        wx.showToast({ title: '上传成功', icon: 'success' });
                    },
                    fail: err => {
                        console.error('上传失败:', err);
                        wx.showToast({ title: '上传失败', icon: 'none' });
                        this.setData({ fileUploaded: false }); // 上传失败时重置状态
                    }
                });
            },
            fail: err => {
                console.error('选择文件失败:', err);
                wx.showToast({ title: '选择文件失败', icon: 'none' });
            }
        });
    }
});    