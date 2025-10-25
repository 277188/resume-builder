const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // 确保已安装 cors

const app = express();
const port = process.env.PORT || 3000;

// 添加 CORS 中间件
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const FEEDBACK_FILE = 'feedback.json';

if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, '[]');
    console.log('已创建反馈文件');
}

// 获取所有反馈
app.get('/api/feedback', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
        res.json(data);
    } catch (error) {
        console.error('读取反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 提交新反馈
app.post('/api/feedback', (req, res) => {
    try {
        const feedback = req.body;
        feedback.id = Date.now().toString();
        feedback.date = new Date().toLocaleString('zh-CN');
        feedback.read = false;
        
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
        data.unshift(feedback);
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
        
        console.log('收到新反馈:', feedback.type);
        res.json({ success: true, message: '反馈提交成功' });
    } catch (error) {
        console.error('保存反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 标记反馈为已读 - 新增
app.put('/api/feedback/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
        
        const feedback = data.find(f => f.id === id);
        if (feedback) {
            feedback.read = true;
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true, message: '反馈已标记为已读' });
        } else {
            res.status(404).json({ success: false, message: '反馈不存在' });
        }
    } catch (error) {
        console.error('标记反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 删除反馈 - 新增
app.delete('/api/feedback/:id', (req, res) => {
    try {
        const { id } = req.params;
        let data = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
        
        const initialLength = data.length;
        data = data.filter(f => f.id !== id);
        
        if (data.length < initialLength) {
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true, message: '反馈已删除' });
        } else {
            res.status(404).json({ success: false, message: '反馈不存在' });
        }
    } catch (error) {
        console.error('删除反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 标记所有反馈为已读 - 新增
app.put('/api/feedback-mark-all-read', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
        
        data.forEach(feedback => {
            feedback.read = true;
        });
        
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: '所有反馈已标记为已读' });
    } catch (error) {
        console.error('标记所有反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`局域网访问: http://192.168.3.13:${port}`);
});