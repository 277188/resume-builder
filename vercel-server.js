
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

const FEEDBACK_FILE = path.join('/tmp', 'feedback.json');


const ensureFeedbackFile = () => {
    try {
        if (!fs.existsSync(FEEDBACK_FILE)) {
            fs.writeFileSync(FEEDBACK_FILE, '[]');
            console.log('已创建反馈文件在 /tmp 目录');
        }
    } catch (error) {
        console.error('创建反馈文件失败:', error);
    }
};


ensureFeedbackFile();


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));


const readFeedbackData = () => {
    try {
        ensureFeedbackFile();
        const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取反馈数据失败:', error);
        return [];
    }
};

const writeFeedbackData = (data) => {
    try {
        ensureFeedbackFile();
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('写入反馈数据失败:', error);
        return false;
    }
};

app.get('/api/feedback', (req, res) => {
    try {
        const data = readFeedbackData();
        res.json(data);
    } catch (error) {
        console.error('读取反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.post('/api/feedback', (req, res) => {
    try {
        const feedback = req.body;
        feedback.id = Date.now().toString();
        feedback.date = new Date().toLocaleString('zh-CN');
        feedback.read = false;
        
        const data = readFeedbackData();
        data.unshift(feedback);
        
        if (writeFeedbackData(data)) {
            console.log('收到新反馈:', feedback.type);
            res.json({ success: true, message: '反馈提交成功' });
        } else {
            res.status(500).json({ success: false, message: '保存失败' });
        }
    } catch (error) {
        console.error('保存反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.put('/api/feedback/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readFeedbackData();
        
        const feedback = data.find(f => f.id === id);
        if (feedback) {
            feedback.read = true;
            if (writeFeedbackData(data)) {
                res.json({ success: true, message: '反馈已标记为已读' });
            } else {
                res.status(500).json({ success: false, message: '保存失败' });
            }
        } else {
            res.status(404).json({ success: false, message: '反馈不存在' });
        }
    } catch (error) {
        console.error('标记反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.delete('/api/feedback/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readFeedbackData();
        
        const initialLength = data.length;
        const newData = data.filter(f => f.id !== id);
        
        if (newData.length < initialLength) {
            if (writeFeedbackData(newData)) {
                res.json({ success: true, message: '反馈已删除' });
            } else {
                res.status(500).json({ success: false, message: '删除失败' });
            }
        } else {
            res.status(404).json({ success: false, message: '反馈不存在' });
        }
    } catch (error) {
        console.error('删除反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.put('/api/feedback-mark-all-read', (req, res) => {
    try {
        const data = readFeedbackData();
        
        data.forEach(feedback => {
            feedback.read = true;
        });
        
        if (writeFeedbackData(data)) {
            res.json({ success: true, message: '所有反馈已标记为已读' });
        } else {
            res.status(500).json({ success: false, message: '保存失败' });
        }
    } catch (error) {
        console.error('标记所有反馈错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((error, req, res, next) => {
    console.error('未处理的错误:', error);
    res.status(500).json({ 
        success: false, 
        message: '内部服务器错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

module.exports = app;
