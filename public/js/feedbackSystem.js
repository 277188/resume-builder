// 反馈系统模块
const FeedbackSystem = {
    // 使用相对路径，这样在生产环境和开发环境都能工作
    apiBaseUrl: '/api',
    feedbackData: [],
    isAdmin: false,
    
    // 初始化方法
    init: function() {
        this.checkAdminMode();
        this.setupFeedbackModal();
        this.setupAboutModal();
        this.setupHelpModal();
        this.setupAdminPanel();
        
        // 如果是管理员模式，从服务器加载数据
        if (this.isAdmin) {
            this.loadFeedbackDataFromServer();
        }
        
        console.log('反馈系统初始化完成，管理员模式:', this.isAdmin);
    },
    
    // 检查管理员模式
    checkAdminMode: function() {
        // 检查URL参数或本地存储中的管理员标志
        const urlParams = new URLSearchParams(window.location.search);
        this.isAdmin = urlParams.has('admin') || localStorage.getItem('resumeAdminMode') === 'true';
        
        if (this.isAdmin) {
            const adminBtn = document.getElementById('admin-btn');
            if (adminBtn) {
                adminBtn.style.display = 'flex';
            }
            localStorage.setItem('resumeAdminMode', 'true');
        }
    },
    
    // 设置反馈模态框
    setupFeedbackModal: function() {
        const feedbackBtn = document.getElementById('feedback-btn');
        const feedbackModal = document.getElementById('feedback-modal');
        
        if (!feedbackBtn || !feedbackModal) {
            console.error('找不到反馈模态框元素');
            return;
        }
        
        const closeBtn = feedbackModal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-feedback');
        const submitBtn = document.getElementById('submit-feedback');
        
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'flex';
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                feedbackModal.style.display = 'none';
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                feedbackModal.style.display = 'none';
            });
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitFeedback();
            });
        }
        
        // 点击模态框外部关闭
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.style.display = 'none';
            }
        });
    },
    
    // 设置关于模态框
    setupAboutModal: function() {
        const aboutLink = document.getElementById('about-link');
        const aboutModal = document.getElementById('about-modal');
        
        if (!aboutLink || !aboutModal) return;
        
        const closeBtn = aboutModal.querySelector('.close-modal');
        const closeAboutBtn = document.getElementById('close-about');
        
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.style.display = 'flex';
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                aboutModal.style.display = 'none';
            });
        }
        
        if (closeAboutBtn) {
            closeAboutBtn.addEventListener('click', () => {
                aboutModal.style.display = 'none';
            });
        }
        
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    },
    
    // 设置帮助模态框
    setupHelpModal: function() {
        const helpLink = document.getElementById('help-link');
        
        if (!helpLink) return;
        
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.createHelpModal();
        });
    },
    
    // 创建帮助模态框
    createHelpModal: function() {
        // 如果已经存在，先移除
        const existingModal = document.getElementById('help-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'help-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">使用帮助</div>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>如何使用简历生成器</h3>
                    <ul>
                        <li><strong>选择模板</strong>：点击顶部模板图标切换不同样式</li>
                        <li><strong>编辑内容</strong>：点击左侧板块，在右侧填写信息</li>
                        <li><strong>调整顺序</strong>：拖拽左侧板块可以重新排序</li>
                        <li><strong>添加板块</strong>：点击"添加板块"创建自定义内容</li>
                        <li><strong>保存简历</strong>：点击"保存简历"导出PDF文件</li>
                        <li><strong>打印</strong>：点击"打印"按钮或使用Ctrl+P</li>
                    </ul>
                    <h3>快捷键</h3>
                    <ul>
                        <li><strong>Ctrl+S</strong>：保存简历为PDF</li>
                        <li><strong>Ctrl+P</strong>：打印简历</li>
                        <li><strong>Ctrl+Shift+A</strong>：启用管理员模式</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="close-help">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 设置帮助模态框事件
        const closeBtn = modal.querySelector('.close-modal');
        const closeHelpBtn = modal.querySelector('#close-help');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    },
    
    // 设置管理员面板
    setupAdminPanel: function() {
        const adminBtn = document.getElementById('admin-btn');
        const adminModal = document.getElementById('feedback-admin-modal');
        
        if (!adminBtn || !adminModal) {
            console.error('找不到管理员面板元素');
            return;
        }
        
        const closeBtn = adminModal.querySelector('.close-modal');
        const closeAdminBtn = document.getElementById('close-admin');
        const exportBtn = document.getElementById('export-feedback');
        const markAllReadBtn = document.getElementById('mark-all-read');
        const filterSelect = document.getElementById('feedback-filter');
        
        adminBtn.addEventListener('click', () => {
            console.log('管理员按钮被点击');
            adminModal.style.display = 'flex';
            this.loadFeedbackDataFromServer();
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                adminModal.style.display = 'none';
            });
        }
        
        if (closeAdminBtn) {
            closeAdminBtn.addEventListener('click', () => {
                adminModal.style.display = 'none';
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportFeedbackData();
            });
        }
        
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.renderFeedbackList();
            });
        }
        
        adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });
    },
    
    // 从服务器加载反馈数据
    loadFeedbackDataFromServer: async function() {
        try {
            console.log('正在从服务器加载反馈数据...');
            const response = await fetch(`${this.apiBaseUrl}/feedback`);
            
            if (response.ok) {
                this.feedbackData = await response.json();
                console.log('成功加载反馈数据:', this.feedbackData.length, '条');
                this.updateAdminStats();
                this.renderFeedbackList();
            } else {
                console.error('加载反馈数据失败，状态码:', response.status);
                this.loadFeedbackDataFromLocal();
            }
        } catch (error) {
            console.error('网络错误:', error);
            this.loadFeedbackDataFromLocal();
        }
    },
    
    // 从本地存储加载（备用）
    loadFeedbackDataFromLocal: function() {
        console.log('从本地存储加载反馈数据');
        const savedData = localStorage.getItem('resumeFeedbackData');
        if (savedData) {
            this.feedbackData = JSON.parse(savedData);
            console.log('从本地存储加载了', this.feedbackData.length, '条反馈');
        } else {
            this.feedbackData = [];
            console.log('本地存储中没有反馈数据');
        }
        this.updateAdminStats();
        this.renderFeedbackList();
    },
    
    // 提交反馈
    submitFeedback: async function() {
        const type = document.getElementById('feedback-type').value;
        const content = document.getElementById('feedback-content').value;
        const contact = document.getElementById('contact-info').value;
        
        if (!content) {
            this.showToast('请填写反馈内容', 'error');
            return;
        }
        
        // 创建反馈对象
        const feedback = {
            type: type,
            content: content,
            contact: contact || '未提供'
        };
        
        try {
            console.log('提交反馈到服务器:', feedback);
            const response = await fetch(`${this.apiBaseUrl}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedback)
            });
            
            if (response.ok) {
                this.showToast('感谢您的反馈！');
                // 关闭模态框并清空表单
                document.getElementById('feedback-modal').style.display = 'none';
                document.getElementById('feedback-content').value = '';
                document.getElementById('contact-info').value = '';
                
                // 如果是管理员模式，重新加载数据
                if (this.isAdmin) {
                    this.loadFeedbackDataFromServer();
                }
            } else {
                throw new Error('服务器响应错误');
            }
        } catch (error) {
            console.error('提交反馈到服务器失败:', error);
            // 服务器提交失败，保存到本地存储
            this.submitFeedbackToLocal(feedback);
        }
    },
    
    // 提交到本地存储（备用）
    submitFeedbackToLocal: function(feedback) {
        feedback.id = Date.now().toString();
        feedback.date = new Date().toLocaleString('zh-CN');
        feedback.read = false;
        
        this.feedbackData.unshift(feedback);
        localStorage.setItem('resumeFeedbackData', JSON.stringify(this.feedbackData));
        this.showToast('感谢您的反馈！(已保存到本地)');
        
        document.getElementById('feedback-modal').style.display = 'none';
        document.getElementById('feedback-content').value = '';
        document.getElementById('contact-info').value = '';
    },
    
    // 标记为已读
    markAsRead: async function(id) {
        console.log('标记反馈为已读:', id);
        try {
            const response = await fetch(`${this.apiBaseUrl}/feedback/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // 更新本地数据
                const feedback = this.feedbackData.find(f => f.id === id);
                if (feedback) {
                    feedback.read = true;
                }
                this.updateAdminStats();
                this.renderFeedbackList();
                this.showToast('反馈已标记为已读');
            } else {
                throw new Error('服务器错误');
            }
        } catch (error) {
            console.error('标记已读失败:', error);
            // 本地处理
            const feedback = this.feedbackData.find(f => f.id === id);
            if (feedback) {
                feedback.read = true;
                localStorage.setItem('resumeFeedbackData', JSON.stringify(this.feedbackData));
                this.updateAdminStats();
                this.renderFeedbackList();
                this.showToast('反馈已标记为已读');
            }
        }
    },
    
    // 删除反馈
    deleteFeedback: async function(id) {
        if (!confirm('确定要删除这条反馈吗？此操作不可撤销。')) {
            return;
        }
        
        console.log('删除反馈:', id);
        try {
            const response = await fetch(`${this.apiBaseUrl}/feedback/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.feedbackData = this.feedbackData.filter(f => f.id !== id);
                this.updateAdminStats();
                this.renderFeedbackList();
                this.showToast('反馈已删除');
            } else {
                throw new Error('服务器错误');
            }
        } catch (error) {
            console.error('删除反馈失败:', error);
            // 本地处理
            this.feedbackData = this.feedbackData.filter(f => f.id !== id);
            localStorage.setItem('resumeFeedbackData', JSON.stringify(this.feedbackData));
            this.updateAdminStats();
            this.renderFeedbackList();
            this.showToast('反馈已删除');
        }
    },
    
    // 标记所有为已读
    markAllAsRead: function() {
        console.log('标记所有反馈为已读');
        this.feedbackData.forEach(feedback => {
            feedback.read = true;
        });
        
        // 尝试同步到服务器
        this.syncAllReadStatus();
        
        localStorage.setItem('resumeFeedbackData', JSON.stringify(this.feedbackData));
        this.updateAdminStats();
        this.renderFeedbackList();
        this.showToast('所有反馈已标记为已读');
    },
    
    // 同步所有已读状态到服务器
    syncAllReadStatus: async function() {
        try {
            await fetch(`${this.apiBaseUrl}/feedback-mark-all-read`, {
                method: 'PUT'
            });
            console.log('已同步所有已读状态到服务器');
        } catch (error) {
            console.error('同步已读状态失败:', error);
        }
    },
    
    // 导出反馈数据
    exportFeedbackData: function() {
        const dataStr = JSON.stringify(this.feedbackData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `feedback-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('反馈数据已导出');
    },
    
    // 更新管理员统计
    updateAdminStats: function() {
        const total = this.feedbackData.length;
        const unread = this.feedbackData.filter(f => !f.read).length;
        const bugs = this.feedbackData.filter(f => f.type === 'bug').length;
        
        const totalElement = document.getElementById('total-feedback');
        const unreadElement = document.getElementById('unread-feedback');
        const bugsElement = document.getElementById('bug-reports');
        
        if (totalElement) totalElement.textContent = total;
        if (unreadElement) unreadElement.textContent = unread;
        if (bugsElement) bugsElement.textContent = bugs;
        
        console.log('统计更新 - 总数:', total, '未读:', unread, '错误报告:', bugs);
    },
    
    // 渲染反馈列表
    renderFeedbackList: function() {
        const feedbackList = document.getElementById('feedback-list');
        const filterSelect = document.getElementById('feedback-filter');
        
        if (!feedbackList) {
            console.error('找不到反馈列表元素');
            return;
        }
        
        let filter = 'all';
        if (filterSelect) {
            filter = filterSelect.value;
        }
        
        let filteredData = this.feedbackData;
        
        if (filter === 'unread') {
            filteredData = filteredData.filter(f => !f.read);
        } else if (filter !== 'all') {
            filteredData = filteredData.filter(f => f.type === filter);
        }
        
        console.log('渲染反馈列表，过滤条件:', filter, '显示条数:', filteredData.length);
        
        if (filteredData.length === 0) {
            feedbackList.innerHTML = `
                <div class="no-feedback">
                    <i class="fas fa-inbox"></i>
                    <p>暂无反馈数据</p>
                </div>
            `;
            return;
        }
        
        feedbackList.innerHTML = filteredData.map(feedback => `
            <div class="feedback-item ${feedback.read ? 'read' : 'unread'}" data-id="${feedback.id}">
                <div class="feedback-header">
                    <span class="feedback-type ${feedback.type}">${this.getTypeText(feedback.type)}</span>
                    <span class="feedback-date">${feedback.date}</span>
                </div>
                <div class="feedback-content">${this.formatFeedbackContent(feedback.content)}</div>
                ${feedback.contact && feedback.contact !== '未提供' ? `
                    <div class="feedback-contact">
                        <i class="fas fa-user"></i> ${feedback.contact}
                    </div>
                ` : ''}
                <div class="feedback-actions">
                    ${!feedback.read ? `
                        <button class="btn btn-secondary mark-read" data-id="${feedback.id}">
                            <i class="fas fa-check"></i> 标记已读
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary delete-feedback" data-id="${feedback.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
        
        // 添加事件监听器
        feedbackList.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.mark-read').dataset.id;
                this.markAsRead(id);
            });
        });
        
        feedbackList.querySelectorAll('.delete-feedback').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-feedback').dataset.id;
                this.deleteFeedback(id);
            });
        });
    },
    
    // 获取反馈类型文本
    getTypeText: function(type) {
        const typeMap = {
            'bug': '错误报告',
            'suggestion': '功能建议',
            'template': '模板建议',
            'other': '其他'
        };
        return typeMap[type] || type;
    },
    
    // 格式化反馈内容
    formatFeedbackContent: function(content) {
        // 简单的换行处理
        return content.replace(/\n/g, '<br>');
    },
    
    // 显示提示消息
    showToast: function(message, type = 'success') {
        // 移除现有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};