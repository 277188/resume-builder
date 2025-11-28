const TemplateEngine = {
    s: (str) => str || '', 
    formatText: (text) => text ? text.replace(/\n/g, '<br>') : '',
    generateContact: (p) => `
        <div class="contact-line">
            ${p.phone ? `<span><i class="fa-solid fa-phone"></i> ${p.phone}</span>` : ''}
            ${p.email ? `<span><i class="fa-solid fa-envelope"></i> ${p.email}</span>` : ''}
            ${p.location ? `<span><i class="fa-solid fa-location-dot"></i> ${p.location}</span>` : ''}
            ${p.website ? `<span><i class="fa-solid fa-globe"></i> ${p.website}</span>` : ''}
        </div>
    `,

    // 辅助：生成通用列表（Work/Edu）
    generateWork: (list) => list.map(w => `
        <div class="resume-item" data-work-id="${w.id}">
            <div class="item-header">
                <span class="company"><strong>${w.company || '公司名称'}</strong></span>
                <span class="date">${w.date || '时间段'}</span>
            </div>
            <div class="role">${w.role || '职位'}</div>
            <div class="desc" data-source-id="work-${w.id}">${TemplateEngine.formatText(w.description)}</div>
        </div>
    `).join(''),

    generateEdu: (list) => list.map(e => `
        <div class="resume-item" data-edu-id="${e.id}">
            <div class="item-header">
                <span class="school"><strong>${e.school || '学校名称'}</strong></span>
                <span class="date">${e.year || '毕业年份'}</span>
            </div>
            <div class="degree">${e.degree || '学位/专业'}</div>
        </div>
    `).join(''),
    
    generateHonors: (list) => list.map(h => `
        <div class="resume-item" data-honor-id="${h.id}">
            <div class="item-header">
                <span class="title"><strong>${h.title || '奖项名称'}</strong></span>
                <span class="date">${h.date || '获奖时间'}</span>
            </div>
            <div class="desc">${TemplateEngine.formatText(h.description)}</div>
        </div>
    `).join(''),

    // 动态生成 Body 内容
    generateDynamicBody: (data) => {
        return data.sectionOrder.map(item => {
            if (item.type === 'personal') return ''; 

            let content = '';
            let title = '';
            
            if (item.type === 'summary' && data.summary) {
                title = '个人简介';
                content = `<div class="item-content" data-source-id="summary">${TemplateEngine.formatText(data.summary)}</div>`;
            } else if (item.type === 'work' && data.work.length) {
                title = '工作经历';
                content = TemplateEngine.generateWork(data.work);
            } else if (item.type === 'education' && data.education.length) {
                title = '教育经历';
                content = TemplateEngine.generateEdu(data.education);
            } else if (item.type === 'skills' && data.skills) {
                title = '技能特长';
                content = `<div class="item-content" data-source-id="skills">${TemplateEngine.formatText(data.skills)}</div>`;
            } else if (item.type === 'honors' && data.honors.length) {
                title = '荣誉奖项';
                content = TemplateEngine.generateHonors(data.honors);
            } else if (item.type === 'custom') {
                const customMod = data.custom.find(c => c.elementId === item.id);
                if (customMod) {
                    title = customMod.title;
                    content = `<div class="item-content" data-source-id="${customMod.elementId}">${TemplateEngine.formatText(customMod.content)}</div>`;
                }
            }

            if (!content) return '';

            return `
                <div class="section section-${item.type}" data-type="${item.type}">
                    <div class="section-title">${title}</div>
                    ${content}
                </div>
            `;
        }).join('');
    },

    // --- 模板 1: 现代商务 ---
    template1: (data) => `
        <div class="t1-header">
            <h1>${TemplateEngine.s(data.personal.name)}</h1>
            <p class="job">${TemplateEngine.s(data.personal.jobTitle)}</p>
            ${TemplateEngine.generateContact(data.personal)}
        </div>
        <div class="t1-body">
            ${TemplateEngine.generateDynamicBody(data)}
        </div>
    `,

    // --- 模板 2: 极简居中 (修复：强制居中) ---
    template2: (data) => `
        <div class="t2-wrapper" style="text-align: center;">
            <header class="t2-header">
                <h1 style="margin-bottom:10px;">${TemplateEngine.s(data.personal.name)}</h1>
                <p class="job" style="margin-bottom:15px; color:#666;">${TemplateEngine.s(data.personal.jobTitle)}</p>
                <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap; font-size:0.9em; margin-bottom:30px;">
                   ${TemplateEngine.generateContact(data.personal)}
                </div>
            </header>
            <div class="t2-body" style="text-align: left; max-width: 800px; margin: 0 auto;">
                ${TemplateEngine.generateDynamicBody(data)}
            </div>
        </div>
    `,

    // --- 模板 3: 侧栏布局 (修复：左右分栏结构) ---
    template3: (data) => {
        const p = data.personal;
        // 生成右侧内容 (Work, Edu, Custom, Summary)
        const rightBody = data.sectionOrder.map(item => {
            if (['work','education','summary','custom'].includes(item.type)) {
                // 复用 generateDynamicBody 的逻辑片段，为了简单这里直接调
                // 但为了控制放在右边，我们过滤一下
                 // 简单处理：直接生成所有非技能非信息的模块
            }
            return '';
        });
        
        // 重新构建 Right Content
        const rightContent = TemplateEngine.generateDynamicBody({
            ...data,
            sectionOrder: data.sectionOrder.filter(i => i.type !== 'skills' && i.type !== 'personal')
        });

        return `
        <div class="t3-layout" style="display:flex; height:100%; min-height:inherit;">
            <aside class="t3-sidebar" style="width:30%; background:#2c3e50; color:#fff; padding:30px 20px; box-sizing:border-box;">
                <h1 style="color:#fff; font-size:1.8em; margin-bottom:5px;">${TemplateEngine.s(p.name)}</h1>
                <p style="color:#bdc3c7; margin-bottom:30px;">${TemplateEngine.s(p.jobTitle)}</p>
                
                <div class="t3-contact-list" style="font-size:0.9em; line-height:2;">
                    ${p.phone ? `<div><i class="fa-solid fa-phone"></i> ${p.phone}</div>` : ''}
                    ${p.email ? `<div><i class="fa-solid fa-envelope"></i> ${p.email}</div>` : ''}
                    ${p.location ? `<div><i class="fa-solid fa-location-dot"></i> ${p.location}</div>` : ''}
                    ${p.website ? `<div><i class="fa-solid fa-globe"></i> ${p.website}</div>` : ''}
                </div>
                
                ${data.skills ? `
                    <div style="margin-top:40px;">
                        <div style="border-bottom:1px solid #7f8c8d; margin-bottom:10px; color:#ecf0f1;">技能特长</div>
                        <div style="font-size:0.9em; line-height:1.6;" data-source-id="skills">${TemplateEngine.formatText(data.skills)}</div>
                    </div>
                ` : ''}
            </aside>
            <main class="t3-main" style="width:70%; padding:30px; background:#fff; box-sizing:border-box;">
                 ${rightContent}
            </main>
        </div>
        `;
    },

    // --- 模板 4: 经典衬线 ---
    template4: (data) => `
        <div class="t4-wrapper">
            <div class="t4-header" style="text-align:center; margin-bottom:20px;">
                <h1 style="font-family:'Merriweather',serif;">${TemplateEngine.s(data.personal.name)}</h1>
                <div style="font-style:italic; color:#555; margin-top:5px;">
                     ${data.personal.phone || ''} &bull; ${data.personal.email || ''}
                </div>
            </div>
            <hr style="border:0; border-top:2px double #333; margin-bottom:20px;">
            ${TemplateEngine.generateDynamicBody(data)}
        </div>
    `,

    // --- 模板 5: 技术极客 (修复：等宽字体+代码风格) ---
    template5: (data) => `
        <div class="t5-wrapper" style="font-family: 'Roboto Mono', monospace; color:#333;">
            <div class="t5-header" style="background:#2d3436; color:#00b894; padding:25px; margin:-25px -25px 25px -25px;">
                <div><span style="color:#ff7675;">const</span> developer = {</div>
                <div style="padding-left:20px;">
                    name: <span style="color:#f1c40f;">"${TemplateEngine.s(data.personal.name)}"</span>,<br>
                    role: <span style="color:#f1c40f;">"${TemplateEngine.s(data.personal.jobTitle)}"</span>
                </div>
                <div>};</div>
                <div style="margin-top:10px; font-size:0.8em; color:#b2bec3;">// ${TemplateEngine.s(data.personal.phone)} | ${TemplateEngine.s(data.personal.email)}</div>
            </div>
            ${TemplateEngine.generateDynamicBody(data)}
        </div>
    `,

    // --- 模板 6: 创意色彩 (修复：增加色彩装饰) ---
    template6: (data) => `
        <div class="t6-layout" style="display:flex; height:100%;">
            <div class="t6-stripe" style="width:15px; background: linear-gradient(to bottom, #ff6b6b, #feca57); margin-right:25px;"></div>
            <div class="t6-content" style="flex:1;">
                <header style="margin-bottom:30px;">
                    <h1 style="color:#ff6b6b; font-size:2.5em; margin:0;">${TemplateEngine.s(data.personal.name)}</h1>
                    <p style="color:#ffa502; font-weight:bold; font-size:1.2em;">${TemplateEngine.s(data.personal.jobTitle)}</p>
                    <div style="margin-top:10px; font-size:0.9em; color:#666;">
                        ${TemplateEngine.generateContact(data.personal)}
                    </div>
                </header>
                ${TemplateEngine.generateDynamicBody(data)}
            </div>
        </div>
    `,

    // --- 模板 7: 紧凑单页 ---
    template7: (data) => `
        <div class="t7-compact">
            <header style="border-bottom:3px solid #333; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <h1 style="margin:0; font-size:1.6em;">${TemplateEngine.s(data.personal.name)}</h1>
                    <span>${TemplateEngine.s(data.personal.jobTitle)}</span>
                </div>
                <div style="text-align:right; font-size:0.8em;">
                    <div>${TemplateEngine.s(data.personal.phone)}</div>
                    <div>${TemplateEngine.s(data.personal.email)}</div>
                </div>
            </header>
            ${TemplateEngine.generateDynamicBody(data)}
        </div>
    `,

    // --- 模板 8: 国际通用 (修复：专业排版) ---
    template8: (data) => `
        <div class="t8-container">
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="text-transform:uppercase; letter-spacing:2px; font-size:2.2em; margin-bottom:5px;">${TemplateEngine.s(data.personal.name)}</h1>
                <p style="color:#666; font-size:1.1em; margin-bottom:15px;">${TemplateEngine.s(data.personal.jobTitle)}</p>
                <div style="border-top:1px solid #ccc; border-bottom:1px solid #ccc; padding:8px 0; font-size:0.9em; color:#444;">
                    ${TemplateEngine.s(data.personal.location)} &middot; ${TemplateEngine.s(data.personal.phone)} &middot; ${TemplateEngine.s(data.personal.email)}
                </div>
            </div>
            ${TemplateEngine.generateDynamicBody(data)}
        </div>
    `,

    // --- 模板 9: 网格区块 (修复：Grid 布局) ---
    template9: (data) => `
        <div class="t9-bg">
            <header style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05); margin-bottom:20px; text-align:center;">
                <h1 style="color:var(--primary-color);">${TemplateEngine.s(data.personal.name)}</h1>
                <p>${TemplateEngine.s(data.personal.jobTitle)}</p>
                ${TemplateEngine.generateContact(data.personal)}
            </header>
            <div class="t9-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                 ${TemplateEngine.generateDynamicBody(data)}
            </div>
        </div>
    `
};
