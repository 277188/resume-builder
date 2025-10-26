
const ResumeGenerator = {
    currentTemplate: '1',
    resumeData: {},
    zoomLevel: 1,
    
    init: function() {
        
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
        this.initDragAndDrop(); 
        
        this.updateResumePreview();
    },
    
    
    initDragAndDrop: function() {
        const sectionsList = document.getElementById('sections-list');
        if (!sectionsList) return;
        
        
        new Sortable(sectionsList, {
            animation: 150,
            handle: '.fa-grip-vertical',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                
                const newOrder = [];
                const sectionElements = sectionsList.querySelectorAll('.resume-section');
                sectionElements.forEach(element => {
                    const sectionKey = element.dataset.section;
                    newOrder.push(sectionKey);
                });
                
                
                const newData = {};
                newOrder.forEach(key => {
                    if (this.resumeData[key]) {
                        newData[key] = this.resumeData[key];
                    }
                });
                
                
                this.resumeData = newData;
                this.updateResumePreview();
                this.saveToLocalStorage();
                
                
                this.updateSectionTitles();
            }
        });
    },
    
    
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
    
    
    saveToLocalStorage: function() {
        localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
        localStorage.setItem('currentTemplate', this.currentTemplate);
    },
    
    
    initTemplateSwitcher: function() {
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.addEventListener('click', () => {
                templateOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                this.currentTemplate = option.getAttribute('data-template');
                const preview = document.getElementById('resume-preview');
                
                
                preview.classList.remove('template-1-style', 'template-2-style', 'template-3-style');
                
                
                preview.classList.add(`template-${this.currentTemplate}-style`);
                
                this.updateResumePreview();
                this.saveToLocalStorage();
            });
        });
    },
    
    
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
    
    
    initAddSection: function() {
        const addSectionBtn = document.getElementById('add-section');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', () => {
                const sectionName = prompt('请输入新板块名称:');
                if (sectionName) {
                    const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
                    
                    
                    this.resumeData[sectionKey] = {
                        title: sectionName,
                        content: "请在此处填写内容..."
                    };
                    
                    
                    this.addSectionToUI(sectionKey, sectionName);
                    
                    
                    this.initDragAndDrop();
                    
                    
                    this.initEditorContent();
                    
                    this.updateResumePreview();
                    this.saveToLocalStorage();
                    
                    
                    this.showSectionEditor(sectionKey);
                }
            });
        }
    },
    
    
    initSaveResume: function() {
        const saveBtn = document.getElementById('save-resume');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }
    },
    
    
    initFormListeners: function() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-control')) {
                this.handleFormInput(e.target);
            }
        });
    },
    
    
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
            
            if (typeof this.resumeData[sectionKey] === 'object' && this.resumeData[sectionKey] !== null) {
                
                this.resumeData[sectionKey][field] = input.value;
                
                
                if (field === 'title') {
                    this.updateSectionTitle(sectionKey, input.value);
                }
            } else {
                
                this.resumeData[sectionKey] = {
                    title: this.resumeData[sectionKey]?.title || sectionKey,
                    content: input.value
                };
            }
        }
        
        this.updateResumePreview();
        this.saveToLocalStorage();
    },
    
    
    updateSectionTitle: function(sectionKey, newTitle) {
        const sectionElement = document.querySelector(`.resume-section[data-section="${sectionKey}"]`);
        if (sectionElement) {
            const titleSpan = sectionElement.querySelector('span');
            if (titleSpan) {
                titleSpan.textContent = newTitle;
            }
        }
    },
    
    
    initSectionClicks: function() {
        const sectionsContainer = document.getElementById('sections-list');
        if (!sectionsContainer) return;
        
        
        sectionsContainer.addEventListener('click', (e) => {
            const sectionElement = e.target.closest('.resume-section');
            if (!sectionElement) return;
            
            
            if (e.target.classList.contains('delete-section') || 
                e.target.closest('.delete-section')) {
                return;
            }
            
            const sectionKey = sectionElement.dataset.section;
            this.showSectionEditor(sectionKey);
        });
    },
    
    
    showSectionEditor: function(sectionKey) {
        
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
        });
        
        
        document.querySelectorAll('.resume-section').forEach(section => {
            section.classList.remove('active');
        });
        
        
        const targetEditor = document.querySelector(`.editor-section[data-section="${sectionKey}"]`);
        if (targetEditor) {
            targetEditor.classList.add('active');
            
            
            const targetSection = document.querySelector(`.resume-section[data-section="${sectionKey}"]`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            
            targetEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    
    initSectionsList: function() {
        const sectionsContainer = document.getElementById('sections-list');
        if (!sectionsContainer) return;
    
        sectionsContainer.innerHTML = '';
    
        Object.keys(this.resumeData).forEach(key => {
            let title = key;
        
            if (key === 'personal') title = '个人信息';
            else if (key === 'summary') title = '个人简介';
            else if (key === 'education') title = '教育背景';
        
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
        
        
        if (!isCore) {
            const deleteBtn = sectionElement.querySelector('.delete-section');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSection(key);
            });
        }
    },
    
    
    isCoreSection: function(key) {
        const coreSections = ['personal', 'summary', 'education'];
        return coreSections.includes(key);
    },
    
    
    deleteSection: function(sectionKey) {
        if (this.isCoreSection(sectionKey)) {
            FeedbackSystem.showToast('核心板块不能删除！', 'error');
            return;
        }
        
        if (confirm(`确定要删除板块【${this.resumeData[sectionKey]?.title || sectionKey}】吗？`)) {
            
            delete this.resumeData[sectionKey];
            
            
            this.initSectionsList();
            this.initEditorContent();
            this.updateResumePreview();
            this.saveToLocalStorage();
            
            FeedbackSystem.showToast('板块已删除');
        }
    },
    
    
    initEditorContent: function() {
        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;
        
        editorContent.innerHTML = '';
        
        const personalEditor = this.createPersonalEditor();
        editorContent.appendChild(personalEditor);
        
        
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
        
        
        Object.keys(this.resumeData).forEach(key => {
            if (!['personal', 'summary', 'education'].includes(key)) {
                const sectionEditor = this.createSectionEditor(key);
                if (sectionEditor) {
                    editorContent.appendChild(sectionEditor);
                }
            }
        });
        
        
        this.showSectionEditor('personal');
    },
    
    
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
            
            section.innerHTML += `
                <div class="form-group">
                    <label for="${sectionKey}-content">内容</label>
                    <textarea id="${sectionKey}-content" class="form-control" data-field="content">${this.resumeData[sectionKey] || ''}</textarea>
                </div>
            `;
        }
        
        return section;
    },
    
    
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
    
    
    deleteArrayItem: function(sectionKey, index) {
        if (this.resumeData[sectionKey] && this.resumeData[sectionKey].length > index) {
            this.resumeData[sectionKey].splice(index, 1);
            this.initEditorContent();
            this.updateResumePreview();
            this.saveToLocalStorage();
            FeedbackSystem.showToast('项目已删除');
        }
    },
    
    
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
    
    
    initPrintFunctionality: function() {
        const printBtn = document.getElementById('print-resume');
        
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    },
    
    
    exportToPDF: function() {
        const element = document.getElementById('resume-preview');
        const saveBtn = document.getElementById('save-resume');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.innerHTML = '<div class="loading"></div> 生成中...';
        saveBtn.disabled = true;
        
        const opt = {
            margin: [10,10,10,10]
            filename: `${this.resumeData.personal.name}_简历.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: ture,
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' ,compress: true}
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            FeedbackSystem.showToast('简历已成功导出为PDF');
        }).catch(err => {
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            FeedbackSystem.showToast('导出失败，请重试', 'error');
            console.error('PDF导出错误:', err);
        });
    },
    
    
    updateResumePreview: function() {
        const preview = document.getElementById('resume-preview');
        if (!preview) return;
        
        const html = TemplateData.generateTemplateHTML(this.currentTemplate, this.resumeData);
        preview.innerHTML = html;
    }
};


document.addEventListener('DOMContentLoaded', function() {
    
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
