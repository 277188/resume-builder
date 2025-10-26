const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 静态文件服务 - 指向 public 目录
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // 缓存1天
  etag: true,
  lastModified: true
}));

// 反馈数据文件路径
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

// 确保反馈文件存在
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, '[]');
  console.log('已创建反馈文件');
}

// 读取反馈数据
const readFeedbackData = () => {
  try {
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取反馈数据失败:', error);
    return [];
  }
};

// 写入反馈数据
const writeFeedbackData = (data) => {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('写入反馈数据失败:', error);
    return false;
  }
};

// API 路由

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'resume-builder',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 获取所有反馈
app.get('/api/feedback', (req, res) => {
  try {
    const data = readFeedbackData();
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('读取反馈错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 提交新反馈
app.post('/api/feedback', (req, res) => {
  try {
    const { type, content, contact } = req.body;
    
    // 验证必要字段
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: '反馈内容不能为空' 
      });
    }
    
    const feedback = {
      id: Date.now().toString(),
      type: type || 'other',
      content: content,
      contact: contact || '未提供',
      date: new Date().toLocaleString('zh-CN'),
      read: false
    };
    
    const data = readFeedbackData();
    data.unshift(feedback); // 最新反馈放在前面
    
    if (writeFeedbackData(data)) {
      console.log('收到新反馈:', feedback.type);
      res.json({ 
        success: true, 
        message: '反馈提交成功',
        data: feedback
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '保存失败' 
      });
    }
  } catch (error) {
    console.error('保存反馈错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 标记反馈为已读
app.put('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readFeedbackData();
    
    const feedback = data.find(f => f.id === id);
    if (feedback) {
      feedback.read = true;
      if (writeFeedbackData(data)) {
        res.json({ 
          success: true, 
          message: '反馈已标记为已读' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '保存失败' 
        });
      }
    } else {
      res.status(404).json({ 
        success: false, 
        message: '反馈不存在' 
      });
    }
  } catch (error) {
    console.error('标记反馈错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 删除反馈
app.delete('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readFeedbackData();
    
    const initialLength = data.length;
    const newData = data.filter(f => f.id !== id);
    
    if (newData.length < initialLength) {
      if (writeFeedbackData(newData)) {
        res.json({ 
          success: true, 
          message: '反馈已删除' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '删除失败' 
        });
      }
    } else {
      res.status(404).json({ 
        success: false, 
        message: '反馈不存在' 
      });
    }
  } catch (error) {
    console.error('删除反馈错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 标记所有反馈为已读
app.put('/api/feedback-mark-all-read', (req, res) => {
  try {
    const data = readFeedbackData();
    
    data.forEach(feedback => {
      feedback.read = true;
    });
    
    if (writeFeedbackData(data)) {
      res.json({ 
        success: true, 
        message: '所有反馈已标记为已读' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '保存失败' 
      });
    }
  } catch (error) {
    console.error('标记所有反馈错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// 获取服务器信息
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: '简历生成器',
      version: '1.6.6',
      description: '在线简历生成工具',
      author: 'Resume Builder Team',
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

// SPA 路由处理 - 所有未匹配的路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('未处理的错误:', error);
  res.status(500).json({ 
    success: false, 
    message: '内部服务器错误',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path
  });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`
🚀 简历生成器服务器已启动!
📍 本地访问: http://localhost:${port}
🌐 网络访问: http://你的IP:${port}
📊 健康检查: http://localhost:${port}/api/health
💾 反馈文件: ${FEEDBACK_FILE}
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('收到终止信号，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
