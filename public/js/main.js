document.addEventListener('DOMContentLoaded', () => {
    const app = new ResumeGenerator();
    window.app = app;

    const uid = (p='id') => p + '-' + Math.random().toString(36).slice(2,9);

    // ============================================
    // 1. 初始化弹窗 & 默认数据
    // ============================================

    setTimeout(() => {
        document.getElementById('welcome-modal').style.display = 'flex';
    }, 500);

    setupModal('settings-btn-trigger', 'settings-modal');
    setupModal('settings-btn-icon-only', 'settings-modal');
    setupModal('top-feedback-btn', 'feedback-modal');

    function setupModal(triggerId, modalId) {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        if (trigger && modal) {
            trigger.addEventListener('click', () => modal.style.display = 'flex');
            modal.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => modal.style.display = 'none'));
            window.addEventListener('click', (e) => { if(e.target===modal) modal.style.display='none'; });
        }
    }

    // ============================================
    // 2. 设置模态框选项卡功能
    // ============================================
    function setupSettingsTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有active类
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // 添加active类到当前选项卡
                btn.classList.add('active');
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // ============================================
    // 3. 符号复制功能
    // ============================================
    function setupSymbolCopy() {
        const symbolBtns = document.querySelectorAll('.symbol-btn');
        const copyStatus = document.getElementById('copy-status');
        
        symbolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const symbol = btn.dataset.symbol;
                
                // 复制到剪贴板
                navigator.clipboard.writeText(symbol).then(() => {
                    copyStatus.textContent = `已复制符号: ${symbol}`;
                    copyStatus.classList.add('show');
                    
                    // 3秒后隐藏提示
                    setTimeout(() => {
                        copyStatus.classList.remove('show');
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                    copyStatus.textContent = '复制失败，请手动复制';
                    copyStatus.classList.add('show');
                    
                    setTimeout(() => {
                        copyStatus.classList.remove('show');
                    }, 2000);
                });
            });
        });
    }

    // ============================================
    // 4. 侧栏 & 工具栏逻辑
    // ============================================
    function ensureSidebarToggle() {
        const top = document.getElementById('left-panel-top');
        const leftPanel = document.querySelector('.left-panel');
        if (!top || !leftPanel) return;

        top.innerHTML = `
            <div class="toolbar-row">
                <button id="sidebar-toggle" class="icon-btn sidebar-toggle"><i class="fa-solid fa-chevron-left"></i></button>
                <button id="sidebar-expand" class="icon-btn sidebar-expand"><i class="fa-solid fa-chevron-right"></i></button>
                <div class="font-format-group">
                    <button class="format-btn" data-cmd="bold" title="加粗"><b>B</b></button>
                    <button class="format-btn" data-cmd="italic" title="斜体"><i>I</i></button>
                    <button class="format-btn" data-cmd="heading" title="标题"><b>H</b></button>
                    <button class="format-btn" id="btn-open-symbols" title="符号库"><i class="fa-solid fa-icons"></i></button>
                    <button class="format-btn" id="btn-insert-image" title="图片"><i class="fa-regular fa-image"></i></button>
                </div>
            </div>
        `;

        const toggle = document.getElementById('sidebar-toggle');
        const expand = document.getElementById('sidebar-expand');
        
        toggle.addEventListener('click', () => leftPanel.classList.add('collapsed'));
        expand.addEventListener('click', () => leftPanel.classList.remove('collapsed'));

        top.querySelectorAll('.format-btn[data-cmd]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = btn.dataset.cmd;
                const preview = document.getElementById('resume-preview');
                if (!preview || preview.contentEditable !== "true") {
                    alert('请先双击预览区文字进入编辑模式'); return;
                }
                if (cmd === 'heading') document.execCommand('formatBlock', false, '<h3>');
                else document.execCommand(cmd, false, null);
                app.collectData();
            });
        });

        // 打开符号库
        document.getElementById('btn-open-symbols').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'flex';
            // 切换到符号标签
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelector('.tab-btn[data-tab="symbols"]').classList.add('active');
            document.getElementById('symbols-tab').classList.add('active');
        });

        // 插入图片
        document.getElementById('btn-insert-image').addEventListener('click', () => {
            const type = prompt('1: 插入头像 (自动适配)\n2: 插入普通图片 (自由拖拽)', '1');
            const input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            input.onchange = (e) => {
                const f = e.target.files[0];
                if(!f) return;
                const r = new FileReader();
                r.onload = (evt) => {
                    if(type==='1') injectAvatar(evt.target.result);
                    else createDraggableImage(evt.target.result);
                };
                r.readAsDataURL(f);
            };
            input.click();
        });
    }

    function insertText(t) {
        const sel = window.getSelection();
        if(sel.rangeCount) {
            const r = sel.getRangeAt(0);
            r.deleteContents();
            r.insertNode(document.createTextNode(t));
            app.collectData();
        }
    }

    // ============================================
    // 5. 模块管理 (带默认值) - 修复个人信息显示问题
    // ============================================
    function createSectionElement(type, opts={}) {
        const el = document.createElement('div');
        el.className = 'editor-section draggable-item';
        el.dataset.type = type;
        el.id = uid('sec');
        const titleMap = { personal: '个人信息', summary: '个人简介', work: '工作经历', education: '教育经历', skills: '技能特长', custom: opts.title || '自定义' };
        
        el.innerHTML = `
            <div class="section-header">
            <h3><span class="title-text">${titleMap[type]}</span></h3>
            <div class="section-controls">
                ${type === 'custom' ? `<button class="btn-delete-module" title="删除模块"><i class="fa-solid fa-trash-can"></i> 删除</button>` : ''}
                <span class="drag-handle"><i class="fa-solid fa-grip-lines"></i></span>
            </div>
            </div>
            <div class="section-body"></div>
        `;
        
        const body = el.querySelector('.section-body');
        if (type === 'personal') {
            // 修复：使用换行和更好的布局
            body.innerHTML = `
            <div class="form-group personal-info-group">
                <div class="personal-row">
                    <input type="text" id="name" placeholder="姓名" value="${opts.name||'阳风'}" oninput="app.collectData()">
                    <input type="text" id="jobTitle" placeholder="职位" value="${opts.jobTitle||'前端开发实习生'}" oninput="app.collectData()">
                </div>
                <div class="personal-row">
                    <input type="text" id="phone" placeholder="电话" value="${opts.phone||'123-4567-8910'}" oninput="app.collectData()">
                    <input type="text" id="email" placeholder="邮箱" value="${opts.email||'yangfeng@bynlk.com'}" oninput="app.collectData()">
                </div>
                <div class="personal-row">
                    <input type="text" id="location" placeholder="城市" value="${opts.location||'东莞'}" oninput="app.collectData()">
                    <input type="text" id="website" placeholder="个人网站/作品集" value="${opts.website||'bynlk.com(留空不显示)'}" oninput="app.collectData()">
                </div>
            </div>
            `;
        } else if (type === 'summary') {
            body.innerHTML = `<textarea id="summary" rows="3" placeholder="个人简介" oninput="app.collectData()">${opts.summary||'对前端开发充满热情，具备扎实的 HTML、CSS 和 JavaScript 基础。熟悉 Vue.js 框架，了解现代前端工程化工具。具备良好的学习能力和团队协作精神，渴望在实际项目中锻炼技能，为团队贡献价值。'}</textarea>`;
        } else if (type === 'skills') {
            body.innerHTML = `<textarea id="skills" rows="4" placeholder="每项技能用逗号或换行分隔" oninput="app.collectData()">${opts.skills||'HTML5, CSS3, JavaScript (ES6+), Vue.js, React, Git, Webpack, Vite, Sass/Less, Flex/Grid, TypeScript'}</textarea>`;
        } else if (type === 'work') {
            body.innerHTML = `<div id="work-list"></div><button class="btn btn-ghost add-item-btn" data-target="work">+ 添加工作经历</button>`;
        } else if (type === 'education') {
            body.innerHTML = `<div id="education-list"></div><button class="btn btn-ghost add-item-btn" data-target="education">+ 添加教育经历</button>`;
        } else if (type === 'custom') {
            body.innerHTML = `<input class="custom-title" value="${opts.title||'项目经验'}" oninput="el.querySelector('.title-text').innerText=this.value;app.collectData()" style="margin-bottom:5px;width:100%;"><textarea class="custom-content" rows="3" oninput="app.collectData()">${opts.content||''}</textarea>`;
        }

        el.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-module')) { 
                if(confirm('确定要删除这个模块吗？')) {
                    el.remove(); 
                    app.collectData(); 
                }
            }
            if (e.target.closest('.add-item-btn')) {
                const t = e.target.closest('.add-item-btn').dataset.target;
                if(t==='work') addWorkItem();
                if(t==='education') addEduItem();
            }
        });
        return el;
    }

    function addWorkItem(defaults={}) {
        const d = document.createElement('div'); d.className='dynamic-form-item'; d.dataset.id=uid('work');
        const comp = defaults.company || '字节跳动';
        const role = defaults.role || '前端开发实习生';
        const date = defaults.date || '2025.6 - 2025.9';
        const desc = defaults.desc || '• 负责组件开发和维护，提升页面性能\n• 参与需求评审和技术方案设计\n• 修复Bug和优化用户体验';
        
        d.innerHTML=`
            <div class="form-group">
                <input class="inp-company" placeholder="公司名称" value="${comp}" oninput="app.collectData()">
                <input class="inp-date" placeholder="工作时间" value="${date}" oninput="app.collectData()">
            </div>
            <input class="inp-role" placeholder="职位" value="${role}" oninput="app.collectData()">
            <textarea class="inp-desc" rows="3" placeholder="工作描述（每项职责用换行分隔）" oninput="app.collectData()">${desc}</textarea>
            <button class="btn-delete-item" onclick="if(confirm('确定删除此项？')) { this.parentElement.remove(); app.collectData(); }"><i class="fa-solid fa-trash"></i> 删除</button>
        `;
        document.getElementById('work-list').appendChild(d);
        app.collectData();
    }
    
    function addEduItem(defaults={}) {
        const d = document.createElement('div'); d.className='dynamic-form-item'; d.dataset.id=uid('edu');
        const school = defaults.school || '东莞城市学院';
        const year = defaults.year || '2023.9 - 2027';
        const degree = defaults.degree || '计算机科学与技术 本科';
        const honors = defaults.honors || '校级奖学金';
        
        d.innerHTML=`
            <div class="form-group">
                <input class="inp-school" placeholder="学校名称" value="${school}" oninput="app.collectData()">
                <input class="inp-year" placeholder="在校时间" value="${year}" oninput="app.collectData()">
            </div>
            <input class="inp-degree" placeholder="专业/学位" value="${degree}" oninput="app.collectData()">
            <textarea class="inp-honors" rows="2" placeholder="荣誉奖项（每项用换行分隔）" oninput="app.collectData()">${honors}</textarea>
            <button class="btn-delete-item" onclick="if(confirm('确定删除此项？')) { this.parentElement.remove(); app.collectData(); }"><i class="fa-solid fa-trash"></i> 删除</button>
        `;
        document.getElementById('education-list').appendChild(d);
        app.collectData();
    }

    function setupAddModuleButton() {
        const c = document.getElementById('module-add-placeholder');
        c.innerHTML = `<button class="add-module-btn" title="添加"><i class="fa-solid fa-plus"></i></button>`;
        c.querySelector('button').addEventListener('click', () => {
            const list = document.getElementById('draggable-sections');
            const sec = createSectionElement('custom', {title:'新模块'});
            list.appendChild(sec);
            sec.scrollIntoView({behavior:'smooth'});
            app.collectData();
        });
    }

    function ensureDefaultSections() {
        const container = document.getElementById('draggable-sections');
        const defaults = ['personal','summary','work','education','skills'];
        defaults.forEach(type => {
            if(!container.querySelector(`[data-type="${type}"]`)) container.appendChild(createSectionElement(type));
        });
        if (!document.getElementById('work-list')?.hasChildNodes()) addWorkItem();
        if (!document.getElementById('education-list')?.hasChildNodes()) addEduItem();
    }

    // 图片与头像逻辑
    function injectAvatar(src) {
        const p = document.getElementById('resume-preview');
        let target = p.querySelector('.t1-header') || p.querySelector('.t2-header') || p.querySelector('.t3-sidebar') || p.querySelector('header');
        if(!target) target = p.querySelector('h1')?.parentNode;
        
        if(target) {
            const old = p.querySelector('.avatar-injected'); if(old) old.remove();
            const img = document.createElement('img');
            img.src = src; img.className = 'avatar-injected';
            img.style.cssText = 'width:100px;height:100px;object-fit:cover;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.1);display:block;margin:0 auto 15px auto;';
            target.insertBefore(img, target.firstChild);
        }
    }

    function createDraggableImage(src) {
        const w = document.createElement('div');
        w.className = 'draggable-img-wrapper';
        w.style.cssText = 'position:absolute;left:50px;top:50px;width:150px;';
        w.innerHTML = `<img src="${src}" style="width:100%;height:100%;"><div class="resize-handle"></div>`;
        document.getElementById('resume-preview').appendChild(w);
        
        let isDrag=false, isResize=false, startX, startY, startW;
        w.addEventListener('mousedown', e => {
            if(e.target.classList.contains('resize-handle')) {
                isResize=true; startX=e.clientX; startW=w.offsetWidth;
            } else {
                isDrag=true; startX=e.clientX; startY=e.clientY;
                w.classList.add('active');
            }
            e.stopPropagation();
        });
        document.addEventListener('mousemove', e => {
            if(isDrag) {
                w.style.left = (w.offsetLeft + e.clientX - startX) + 'px';
                w.style.top = (w.offsetTop + e.clientY - startY) + 'px';
                startX=e.clientX; startY=e.clientY;
            } else if(isResize) {
                w.style.width = (startW + e.clientX - startX) + 'px';
            }
        });
        document.addEventListener('mouseup', () => { isDrag=false; isResize=false; w.classList.remove('active'); });
    }

    // ============================================
    // 6. 主题切换
    // ============================================
    function setupThemeToggle() {
        const b = document.getElementById('theme-toggle');
        b.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        b.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            b.innerHTML = document.body.classList.contains('dark-mode') ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
        });
    }

    // ============================================
    // 7. 反馈提交逻辑
    // ============================================
    const sendFeedbackBtn = document.getElementById('send-feedback-btn');
    if (sendFeedbackBtn) {
        sendFeedbackBtn.addEventListener('click', async () => {
            const type = document.getElementById('feedback-type').value;
            const content = document.getElementById('feedback-content').value;
            const contact = document.getElementById('feedback-contact').value;

            if (!content.trim()) { alert('请填写反馈内容'); return; }

            const feedbackData = {
                type: type,
                content: content,
                contact: contact,
                timestamp: new Date().toISOString()
            };

            sendFeedbackBtn.innerText = '发送中...';
            try {
                console.log('Feedback Sending:', JSON.stringify(feedbackData));
                await new Promise(r => setTimeout(r, 800));
                alert('感谢您的反馈！');
                document.getElementById('feedback-content').value = '';
                document.getElementById('feedback-modal').style.display = 'none';
            } catch (e) {
                alert('发送失败');
            } finally {
                sendFeedbackBtn.innerText = '提交反馈';
            }
        });
    }

    // ============================================
    // 8. 初始化执行
    // ============================================
    setupThemeToggle();
    ensureSidebarToggle();
    ensureDefaultSections();
    setupAddModuleButton();
    setupSettingsTabs();
    setupSymbolCopy();
    
    document.querySelector('.editor-panel').addEventListener('input', () => app.collectData());
    Sortable.create(document.getElementById('draggable-sections'), { 
        handle:'.drag-handle', 
        animation: 150,
        onEnd:() => {
            app.collectData();
            app.render();
        } 
    });
    
    const pv = document.getElementById('resume-preview');
    pv.addEventListener('dblclick', () => { 
        pv.contentEditable = "true"; 
        pv.focus(); 
    });
    document.addEventListener('click', e => { 
        if(!pv.contains(e.target) && !e.target.closest('.format-btn')) 
            pv.contentEditable = "false"; 
    });

    document.getElementById('templateSelect').addEventListener('change', e => app.setTemplate(e.target.value));
    document.getElementById('exportBtn').addEventListener('click', () => app.exportPDF());

    app.collectData(); 
    app.render();
});
