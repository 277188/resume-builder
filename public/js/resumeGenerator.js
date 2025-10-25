// JavaScript核心模块
const ResumeGenerator = {
    currentTemplate: '1',
    resumeData: {},
    zoomLevel: 1,
    
    init: function() {
        // 从本地存储加载数据或使用默认数据
        this.loadFromLocalStorage();
        
        this.initTemplateSwitcher();
        this.initPreviewToggle();
        this.initAddSection();
        this.initSaveResume();
        this.initFormListeners();
        this.initSectionsList();
        this.initEditorContent();
        this.initZoomControls();
        this.initPrintFunctionality();
        this.initSectionClicks();
        this.initDragAndDrop(); // 新增：初始化拖拽联动
        
        this.updateResumePreview();
    },
    
    // 初始化拖拽联动
    initDragAndDrop: function() {
        const sectionsList = document.getElementById('sections-list');
        if (!sectionsList) return;
        
        // 使用Sortable.js初始化拖拽
        new Sortable(sectionsList, {
            animation: 150,
            handle: '.fa-grip-vertical',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                // 重新排序数据
                const newOrder = [];
                const sectionElements = sectionsList.querySelectorAll('.resume-section');
                sectionElements.forEach(element => {
                    const sectionKey = element.dataset.section;
                    newOrder.push(sectionKey);
                });
                
                // 重新组织数据
                const newData = {};
                newOrder.forEach(key => {
                    if (this.resumeData[key]) {
                        newData[key] = this.resumeData[key];
                    }
                });
                
                // 更新数据
                this.resumeData = newData;
                this.updateResumePreview();
                this.saveToLocalStorage();
                
                // 更新左侧板块名称显示
                this.updateSectionTitles();
            }
        });
    },
    
    // 更新左侧板块名称显示
    updateSectionTitles: function() {
        const sectionElements = document.querySelectorAll('.resume-section');
        sectionElements.forEach(element => {
            const sectionKey = element.dataset.section;
            const titleSpan = element.querySelector('span');
            
            if (titleSpan) {
                let title = sectionKey;
                
                if (sectionKey === 'personal') title = '个人信息';
                else if (sectionKey === 'summary') title = '个人简介';
                else if (sectionKey === 'education') title = '教育背景';
                else if (this.resumeData[sectionKey] && this.resumeData[sectionKey].title) {
                    title = this.resumeData[sectionKey].title;
                } else {
                    title = sectionKey.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                }
                
                titleSpan.textContent = title;
            }
        });
    },
    
    // 从本地存储加载数据
    loadFromLocalStorage: function() {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            this.resumeData = JSON.parse(savedData);
        } else {
            this.resumeData = JSON.parse(JSON.stringify(TemplateData.defaultResumeData));
        }
        
        const savedTemplate = localStorage.getItem('currentTemplate');
        if (savedTemplate) {
            this.currentTemplate = savedTemplate;
            document.querySelectorAll('.template-option').forEach(option => {
                option.classList.toggle('active', option.getAttribute('data-template') === savedTemplate);
            });
        }
    },
    
    // 保存数据到本地存储
    saveToLocalStorage: function() {
        localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
        localStorage.setItem('currentTemplate', this.currentTemplate);
    },
    
    // 初始化模板切换
    initTemplateSwitcher: function() {
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.addEventListener('click', () => {
                templateOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                this.currentTemplate = option.getAttribute('data-template');
                const preview = document.getElementById('resume-preview');
                
                // 移除所有模板类
                preview.classList.remove('template-1-style', 'template-2-style', 'template-3-style');
                
                // 添加选中的模板类
                preview.classList.add(`template-${this.currentTemplate}-style`);
                
                this.updateResumePreview();
                this.saveToLocalStorage();
            });
        });
    },
    
    // 初始化预览/编辑切换
    initPreviewToggle: function() {
        const previewToggle = document.getElementById('preview-toggle');
        const rightPanel = document.querySelector('.right-panel');
        const leftPanel = document.querySelector('.left-panel');
        
        if (previewToggle) {
            previewToggle.addEventListener('click', function() {
                if (rightPanel.style.display === 'none') {
                    rightPanel.style.display = 'block';
                    leftPanel.style.display = 'block';
                    previewToggle.innerHTML = '<i class="fas fa-eye"></i><span>预览</span>';
                } else {
                    rightPanel.style.display = 'none';
                    leftPanel.style.display = 'none';
                    previewToggle.innerHTML = '<i class="fas fa-edit"></i><span>编辑</span>';
                }
            });
        }
    },
    
    // 初始化添加板块功能
    initAddSection: function() {
        const addSectionBtn = document.getElementById('add-section');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', () => {
                const sectionName = prompt('请输入新板块名称:');
                if (sectionName) {
                    const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
                    
                    // 添加到数据
                    this.resumeData[sectionKey] = {
                        title: sectionName,
                        content: "请在此处填写内容..."
                    };
                    
                    // 添加到UI
                    this.addSectionToUI(sectionKey, sectionName);
                    
                    // 重新初始化拖拽
                    this.initDragAndDrop();
                    
                    // 更新编辑器内容
                    this.initEditorContent();
                    
                    this.updateResumePreview();
                    this.saveToLocalStorage();
                    
                    // 滚动到新添加的板块
                    this.showSectionEditor(sectionKey);
                }
            });
        }
    },
    
    // 初始化保存简历功能
    initSaveResume: function() {
        const saveBtn = document.getElementById('save-resume');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }
    },
    
    // 初始化表单监听
    initFormListeners: function() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-control')) {
                this.handleFormInput(e.target);
            }
        });
    },
    
    // 处理表单输入 - 修复自定义模块数据更新问题
    handleFormInput: function(input) {
        const section = input.closest('.editor-section');
        if (!section) return;
        
        const sectionKey = section.dataset.section;
        const field = input.dataset.field;
        
        if (sectionKey === 'personal') {
            this.resumeData.personal[field] = input.value;
        } else if (Array.isArray(this.resumeData[sectionKey])) {
            const index = parseInt(input.dataset.index);
            if (!isNaN(index) && this.resumeData[sectionKey][index]) {
                this.resumeData[sectionKey][index][field] = input.value;
            }
        } else if (sectionKey === 'summary') {
            this.resumeData.summary = input.value;
        } else {
            // 处理自定义模块
            if (typeof this.resumeData[sectionKey] === 'object' && this.resumeData[sectionKey] !== null) {
                // 更新对象属性
                this.resumeData[sectionKey][field] = input.value;
                
                // 如果更新的是标题，同步更新左侧板块名称
                if (field === 'title') {
                    this.updateSectionTitle(sectionKey, input.value);
                }
            } else {
                // 如果是字符串类型，转换为对象
                this.resumeData[sectionKey] = {
                    title: this.resumeData[sectionKey]?.title || sectionKey,
                    content: input.value
                };
            }
        }
        
        this.updateResumePreview();
        this.saveToLocalStorage();
    },
    
    // 更新单个板块标题
    updateSectionTitle: function(sectionKey, newTitle) {
        const sectionElement = document.querySelector(`.resume-section[data-section="${sectionKey}"]`);
        if (sectionElement) {
            const titleSpan = sectionElement.querySelector('span');
            if (titleSpan) {
                titleSpan.textContent = newTitle;
            }
        }
    },
    
    // 初始化左侧边栏点击事件
    initSectionClicks: function() {
        const sectionsContainer = document.getElementById('sections-list');
        if (!sectionsContainer) return;
        
        // 使用事件委托处理点击事件
        sectionsContainer.addEventListener('click', (e) => {
            const sectionElement = e.target.closest('.resume-section');
            if (!sectionElement) return;
            
            // 如果点击的是删除按钮，不处理
            if (e.target.classList.contains('delete-section') || 
                e.target.closest('.delete-section')) {
                return;
            }
            
            const sectionKey = sectionElement.dataset.section;
            this.showSectionEditor(sectionKey);
        });
    },
    
    // 显示指定板块的编辑器
    showSectionEditor: function(sectionKey) {
        // 移除所有编辑器的active状态
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 移除所有左侧板块的active状态
        document.querySelectorAll('.resume-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 激活指定板块的编辑器
        const targetEditor = document.querySelector(`.editor-section[data-section="${sectionKey}"]`);
        if (targetEditor) {
            targetEditor.classList.add('active');
            
            // 激活左侧板块
            const targetSection = document.querySelector(`.resume-section[data-section="${sectionKey}"]`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // 滚动到该编辑器
            targetEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    // 初始化板块列表
    initSectionsList: function() {
        const sectionsContainer = document.getElementById('sections-list');
        if (!sectionsContainer) return;
    
        sectionsContainer.innerHTML = '';
    
        Object.keys(this.resumeData).forEach(key => {
            let title = key;
        
            if (key === 'personal') title = '个人信息';
            else if (key === 'summary') title = '个人简介';
            else if (key === 'education') title = '教育背景';
        // 添加以下中文映射
            else if (key === 'experience') title = '项目经历';
            else if (key === 'skills') title = '技能专长';
            else if (key === 'projects') title = '个人项目';
            else if (key === 'certifications') title = '证书认证';
            else if (key === 'activities') title = '校园活动';
            else if (this.resumeData[key] && this.resumeData[key].title) {
                title = this.resumeData[key].title;
            } else {
                title = key.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
        
            this.addSectionToUI(key, title);
        });
    },
    
    // 添加板块到UI
    addSectionToUI: function(key, title) {
        const sectionsContainer = document.getElementById('sections-list');
        if (!sectionsContainer) return;
        
        const sectionElement = document.createElement('div');
        sectionElement.className = 'resume-section';
        sectionElement.setAttribute('data-section', key);
        
        const isCore = this.isCoreSection(key);
        
        sectionElement.innerHTML = `
            <span>${title}</span>
            <div class="section-actions">
                <i class="fas fa-grip-vertical"></i>
                ${isCore ? '' : '<i class="fas fa-trash delete-section"></i>'}
            </div>
        `;
        
        sectionsContainer.appendChild(sectionElement);
        
        // 添加删除事件
        if (!isCore) {
            const deleteBtn = sectionElement.querySelector('.delete-section');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSection(key);
            });
        }
    },
    
    // 检查是否为核心板块（不可删除）
    isCoreSection: function(key) {
        const coreSections = ['personal', 'summary', 'education'];
        return coreSections.includes(key);
    },
    
    // 删除板块
    deleteSection: function(sectionKey) {
        if (this.isCoreSection(sectionKey)) {
            FeedbackSystem.showToast('核心板块不能删除！', 'error');
            return;
        }
        
        if (confirm(`确定要删除板块【${this.resumeData[sectionKey]?.title || sectionKey}】吗？`)) {
            // 从数据中删除
            delete this.resumeData[sectionKey];
            
            // 重新初始化UI
            this.initSectionsList();
            this.initEditorContent();
            this.updateResumePreview();
            this.saveToLocalStorage();
            
            FeedbackSystem.showToast('板块已删除');
        }
    },
    
    // 初始化编辑器内容
    initEditorContent: function() {
        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;
        
        editorContent.innerHTML = '';
        
        const personalEditor = this.createPersonalEditor();
        editorContent.appendChild(personalEditor);
        
        // 保留个人信息、个人简介和教育背景的编辑器
        if (this.resumeData.summary) {
            const summaryEditor = this.createSectionEditor('summary');
            if (summaryEditor) {
                editorContent.appendChild(summaryEditor);
            }
        }
        
        if (this.resumeData.education) {
            const educationEditor = this.createSectionEditor('education');
            if (educationEditor) {
                editorContent.appendChild(educationEditor);
            }
        }
        
        // 添加其他自定义板块的编辑器
        Object.keys(this.resumeData).forEach(key => {
            if (!['personal', 'summary', 'education'].includes(key)) {
                const sectionEditor = this.createSectionEditor(key);
                if (sectionEditor) {
                    editorContent.appendChild(sectionEditor);
                }
            }
        });
        
        // 默认激活个人信息编辑器
        this.showSectionEditor('personal');
    },
    
    // 创建个人信息编辑器
    createPersonalEditor: function() {
        const section = document.createElement('div');
        section.className = 'editor-section';
        section.dataset.section = 'personal';
        
        section.innerHTML = `
            <h3>个人信息</h3>
            <div class="form-group">
                <label for="full-name">姓名</label>
                <input type="text" id="full-name" class="form-control" data-field="name" value="${this.resumeData.personal.name}">
            </div>
            
            <div class="form-group">
                <label for="job-title">职位</label>
                <input type="text" id="job-title" class="form-control" data-field="title" value="${this.resumeData.personal.title}">
            </div>
            
            <div class="form-group">
                <label for="phone">电话</label>
                <input type="text" id="phone" class="form-control" data-field="phone" value="${this.resumeData.personal.phone}">
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" class="form-control" data-field="email" value="${this.resumeData.personal.email}">
            </div>
            
            <div class="form-group">
                <label for="address">地址</label>
                <input type="text" id="address" class="form-control" data-field="address" value="${this.resumeData.personal.address}">
            </div>
            
            <div class="form-group">
                <label for="website">个人网站 (可选)</label>
                <input type="text" id="website" class="form-control" data-field="website" value="${this.resumeData.personal.website}">
            </div>
            
            <div class="form-group">
                <label for="linkedin">LinkedIn (可选)</label>
                <input type="text" id="linkedin" class="form-control" data-field="linkedin" value="${this.resumeData.personal.linkedin}">
            </div>
            
            <div class="form-group">
                <label for="github">GitHub (可选)</label>
                <input type="text" id="github" class="form-control" data-field="github" value="${this.resumeData.personal.github}">
            </div>
        `;
        
        return section;
    },
    
    // 创建板块编辑器
    createSectionEditor: function(sectionKey) {
        const section = document.createElement('div');
        section.className = 'editor-section';
        section.dataset.section = sectionKey;
        
        let title = sectionKey;
        if (sectionKey === 'summary') title = '个人简介';
        else if (sectionKey === 'education') title = '教育背景';
        else if (this.resumeData[sectionKey] && this.resumeData[sectionKey].title) {
            title = this.resumeData[sectionKey].title;
        } else {
            title = sectionKey.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        
        section.innerHTML = `<h3>${title}</h3>`;
        
        if (sectionKey === 'summary') {
            section.innerHTML += `
                <div class="form-group">
                    <label for="summary-content">内容</label>
                    <textarea id="summary-content" class="form-control" data-field="content">${this.resumeData.summary}</textarea>
                </div>
            `;
        } else if (Array.isArray(this.resumeData[sectionKey])) {
            this.resumeData[sectionKey].forEach((item, index) => {
                section.innerHTML += this.createArrayItemEditor(sectionKey, item, index);
            });
            
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-secondary';
            addButton.innerHTML = '<i class="fas fa-plus"></i> 添加项目';
            addButton.addEventListener('click', () => {
                this.addArrayItem(sectionKey);
                this.initEditorContent();
                this.updateResumePreview();
                this.saveToLocalStorage();
            });
            
            section.appendChild(addButton);
        } else if (typeof this.resumeData[sectionKey] === 'object' && this.resumeData[sectionKey] !== null) {
            // 处理自定义对象模块
            const content = this.resumeData[sectionKey].content || '';
            section.innerHTML += `
                <div class="form-group">
                    <label for="${sectionKey}-title">板块标题</label>
                    <input type="text" id="${sectionKey}-title" class="form-control" data-field="title" value="${this.resumeData[sectionKey].title || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-content">内容</label>
                    <textarea id="${sectionKey}-content" class="form-control" data-field="content">${content}</textarea>
                </div>
            `;
        } else {
            // 处理字符串类型的自定义板块
            section.innerHTML += `
                <div class="form-group">
                    <label for="${sectionKey}-content">内容</label>
                    <textarea id="${sectionKey}-content" class="form-control" data-field="content">${this.resumeData[sectionKey] || ''}</textarea>
                </div>
            `;
        }
        
        return section;
    },
    
    // 创建数组项目编辑器
    createArrayItemEditor: function(sectionKey, item, index) {
        let fields = '';
        
        if (sectionKey === 'education') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-title-${index}">学校与专业</label>
                    <input type="text" id="${sectionKey}-title-${index}" class="form-control" data-field="title" data-index="${index}" value="${item.title || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-period-${index}">时间</label>
                    <input type="text" id="${sectionKey}-period-${index}" class="form-control" data-field="period" data-index="${index}" value="${item.period || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-description-${index}">描述</label>
                    <textarea id="${sectionKey}-description-${index}" class="form-control" data-field="description" data-index="${index}">${item.description || ''}</textarea>
                </div>
            `;
        } else if (sectionKey === 'experience') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-title-${index}">职位与公司</label>
                    <input type="text" id="${sectionKey}-title-${index}" class="form-control" data-field="title" data-index="${index}" value="${item.title || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-period-${index}">时间</label>
                    <input type="text" id="${sectionKey}-period-${index}" class="form-control" data-field="period" data-index="${index}" value="${item.period || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-description-${index}">描述</label>
                    <textarea id="${sectionKey}-description-${index}" class="form-control" data-field="description" data-index="${index}">${item.description || ''}</textarea>
                </div>
            `;
        } else if (sectionKey === 'skills') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-name-${index}">技能名称</label>
                    <input type="text" id="${sectionKey}-name-${index}" class="form-control" data-field="name" data-index="${index}" value="${item.name || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-level-${index}">熟练程度 (0-100)</label>
                    <input type="number" id="${sectionKey}-level-${index}" class="form-control" data-field="level" data-index="${index}" min="0" max="100" value="${item.level || ''}">
                </div>
            `;
        } else if (sectionKey === 'projects') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-title-${index}">项目名称</label>
                    <input type="text" id="${sectionKey}-title-${index}" class="form-control" data-field="title" data-index="${index}" value="${item.title || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-description-${index}">项目描述</label>
                    <textarea id="${sectionKey}-description-${index}" class="form-control" data-field="description" data-index="${index}">${item.description || ''}</textarea>
                </div>
            `;
        } else if (sectionKey === 'languages') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-name-${index}">语言</label>
                    <input type="text" id="${sectionKey}-name-${index}" class="form-control" data-field="name" data-index="${index}" value="${item.name || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-level-${index}">熟练程度</label>
                    <input type="text" id="${sectionKey}-level-${index}" class="form-control" data-field="level" data-index="${index}" value="${item.level || ''}">
                </div>
            `;
        } else if (sectionKey === 'certifications') {
            fields = `
                <div class="form-group">
                    <label for="${sectionKey}-title-${index}">证书名称</label>
                    <input type="text" id="${sectionKey}-title-${index}" class="form-control" data-field="title" data-index="${index}" value="${item.title || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-issuer-${index}">颁发机构</label>
                    <input type="text" id="${sectionKey}-issuer-${index}" class="form-control" data-field="issuer" data-index="${index}" value="${item.issuer || ''}">
                </div>
                <div class="form-group">
                    <label for="${sectionKey}-date-${index}">获得日期</label>
                    <input type="text" id="${sectionKey}-date-${index}" class="form-control" data-field="date" data-index="${index}" value="${item.date || ''}">
                </div>
            `;
        }
        
        return `
            <div class="array-item" data-index="${index}">
                <h4>项目 ${index + 1}</h4>
                ${fields}
                <button type="button" class="btn btn-secondary remove-item" data-section="${sectionKey}" data-index="${index}">
                    <i class="fas fa-trash"></i> 删除
                </button>
                <hr>
            </div>
        `;
    },
    
    // 添加数组项目
    addArrayItem: function(sectionKey) {
        const emptyItem = {};
        
        if (sectionKey === 'experience' || sectionKey === 'education') {
            emptyItem.title = '';
            emptyItem.period = '';
            emptyItem.description = '';
        } else if (sectionKey === 'skills') {
            emptyItem.name = '';
            emptyItem.level = 50;
        } else if (sectionKey === 'projects') {
            emptyItem.title = '';
            emptyItem.description = '';
        } else if (sectionKey === 'languages') {
            emptyItem.name = '';
            emptyItem.level = '熟练';
        } else if (sectionKey === 'certifications') {
            emptyItem.title = '';
            emptyItem.issuer = '';
            emptyItem.date = '';
        }
        
        if (!Array.isArray(this.resumeData[sectionKey])) {
            this.resumeData[sectionKey] = [];
        }
        this.resumeData[sectionKey].push(emptyItem);
    },
    
    // 删除数组项目
    deleteArrayItem: function(sectionKey, index) {
        if (this.resumeData[sectionKey] && this.resumeData[sectionKey].length > index) {
            this.resumeData[sectionKey].splice(index, 1);
            this.initEditorContent();
            this.updateResumePreview();
            this.saveToLocalStorage();
            FeedbackSystem.showToast('项目已删除');
        }
    },
    
    // 初始化缩放控制
    initZoomControls: function() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomLevel = document.querySelector('.zoom-level');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                this.zoomLevel = Math.min(1.5, this.zoomLevel + 0.1);
                this.updateZoom();
            });
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
                this.updateZoom();
            });
        }
        
        this.updateZoom();
    },
    
    // 更新缩放
    updateZoom: function() {
        const resumePreview = document.getElementById('resume-preview');
        const zoomLevel = document.querySelector('.zoom-level');
        
        if (resumePreview) {
            resumePreview.style.transform = `scale(${this.zoomLevel})`;
        }
        
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    },
    
    // 初始化打印功能
    initPrintFunctionality: function() {
        const printBtn = document.getElementById('print-resume');
        
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    },
    
    // 导出为PDF
    exportToPDF: function() {
        const element = document.getElementById('resume-preview');
        const saveBtn = document.getElementById('save-resume');
        const originalText = saveBtn.innerHTML;
        
        // 显示加载状态
        saveBtn.innerHTML = '<div class="loading"></div> 生成中...';
        saveBtn.disabled = true;
        
        // 设置PDF选项
        const opt = {
            margin: 10,
            filename: `${this.resumeData.personal.name}_简历.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // 生成PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            FeedbackSystem.showToast('简历已成功导出为PDF');
        }).catch(err => {
            // 恢复按钮状态
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            FeedbackSystem.showToast('导出失败，请重试', 'error');
            console.error('PDF导出错误:', err);
        });
    },
    
    // 更新简历预览
    updateResumePreview: function() {
        const preview = document.getElementById('resume-preview');
        if (!preview) return;
        
        const html = TemplateData.generateTemplateHTML(this.currentTemplate, this.resumeData);
        preview.innerHTML = html;
    }
};

// 初始化删除项目的事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 使用事件委托处理删除项目按钮的点击事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
            const sectionKey = button.dataset.section;
            const index = parseInt(button.dataset.index);
            
            if (sectionKey && !isNaN(index)) {
                if (confirm('确定要删除这个项目吗？')) {
                    ResumeGenerator.deleteArrayItem(sectionKey, index);
                }
            }
        }
    });
});