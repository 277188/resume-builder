
const TemplateData = {
    
    defaultResumeData: {
        personal: {
            name: "张三",
            title: "在校实习生",
            phone: "12345678901",
            email: "zhangsan@QQ.com",
            address: "广东省东莞市",
            website: "",
            linkedin: "",
            github: ""
        },
        summary: "东莞城市学院计算机科学与技术专业在读学生，对前端开发和Web技术有浓厚兴趣。具备扎实的编程基础，熟悉HTML、CSS、JavaScript等Web开发技术。积极参与学校项目实践，渴望在实习岗位上锻炼专业技能，积累实战经验。",
        education: [
            {
                title: "计算机科学与技术 - 东莞城市学院",
                period: "2023年9月 - 2027年6月 | 本科",
                description: "主修课程：数据结构、算法设计、Web开发、数据库原理、软件工程、计算机网络、操作系统等。目前GPA: 3.6/4.0。"
            }
        ],
        experience: [
            {
                title: "课程设计 - 学生信息管理系统",
                period: "2025年5月 - 2024年6月",
                description: "独立完成基于Python与MySQL的学生信息管理系统开发，实现学生信息的增删改查功能。通过该项目加深了对面向对象编程和数据库操作的理解。"
            }
        ],
        skills: [
            { name: "HTML/CSS", level: 85 },
            { name: "JavaScript", level: 75 },
            { name: "Java", level: 70 },
            { name: "Python", level: 65 },
            { name: "MySQL", level: 60 },
            { name: "Git", level: 55 }
        ],
        projects: [
            {
                title: "个人博客网站",
                description: "使用HTML、CSS和JavaScript开发的响应式个人博客网站，支持文章展示、分类和搜索功能。部署在GitHub Pages上。"
            },
            {
                title: "在线简历生成器",
                description: "独立开发的Web应用，帮助用户快速创建专业简历。个人负责所有部分开发。"
            }
        ],
        certifications: [
            {
                title: "全国计算机等级考试二级",
                issuer: "教育部考试中心",
                date: "2024年3月"
            },
            {
                title: "英语四级证书",
                issuer: "全国大学英语四六级考试委员会",
                date: "2023年12月"
            }
        ],
    },

    
    generateTemplateHTML: function(templateId, data) {
        const templates = {
            '1': this.template1,
            '2': this.template2,
            '3': this.template3
        };
        
        const templateFunction = templates[templateId];
        if (templateFunction) {
            return templateFunction.call(this, data);
        }
        return this.template1(data);
    },

    
    formatTextWithLineBreaks: function(text) {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    },

    
    generateContactHTML: function(personal) {
        let contactHTML = '';
        if (personal.phone) {
            contactHTML += `<p><i class="fas fa-phone"></i> ${personal.phone}</p>`;
        }
        if (personal.email) {
            contactHTML += `<p><i class="fas fa-envelope"></i> ${personal.email}</p>`;
        }
        if (personal.address) {
            contactHTML += `<p><i class="fas fa-map-marker-alt"></i> ${personal.address}</p>`;
        }
        if (personal.website) {
            contactHTML += `<p><i class="fas fa-globe"></i> ${personal.website}</p>`;
        }
        if (personal.linkedin) {
            contactHTML += `<p><i class="fab fa-linkedin"></i> ${personal.linkedin}</p>`;
        }
        if (personal.github) {
            contactHTML += `<p><i class="fab fa-github"></i> ${personal.github}</p>`;
        }
        return contactHTML;
    },

    
    generateSkillsHTML: function(skills) {
        if (!skills || !Array.isArray(skills)) return '';
        
        return skills.map(skill => `
            <div class="skill-item">
                <div class="skill-name">
                    <span>${skill.name || ''}</span>
                    <span>${skill.level || 0}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-level" style="width: ${skill.level || 0}%"></div>
                </div>
            </div>
        `).join('');
    },

    
    generateExperienceHTML: function(experiences, type = 'experience') {
        if (!experiences || !Array.isArray(experiences)) return '';
        
        return experiences.map(exp => `
            <div class="${type}-item">
                <div class="item-title">${exp.title || ''}</div>
                <div class="item-subtitle">${exp.period || ''}</div>
                <p>${this.formatTextWithLineBreaks(exp.description || '')}</p>
            </div>
        `).join('');
    },

    
    generateCertificationsHTML: function(certifications) {
        if (!certifications || !Array.isArray(certifications)) return '';
        
        return certifications.map(cert => `
            <div class="experience-item">
                <div class="item-title">${cert.title || ''}</div>
                <div class="item-subtitle">${cert.issuer || ''} | ${cert.date || ''}</div>
            </div>
        `).join('');
    },

    
    generateActivitiesHTML: function(activities) {
        if (!activities || !Array.isArray(activities)) return '';
        
        return activities.map(activity => `
            <div class="experience-item">
                <div class="item-title">${activity.title || ''}</div>
                <div class="item-subtitle">${activity.period || ''}</div>
                <p>${this.formatTextWithLineBreaks(activity.description || '')}</p>
            </div>
        `).join('');
    },

    
    template1: function(data) {
        const contactHTML = this.generateContactHTML(data.personal);
        const skillsHTML = this.generateSkillsHTML(data.skills);
        const experienceHTML = this.generateExperienceHTML(data.experience);
        const educationHTML = this.generateExperienceHTML(data.education, 'education');
        const projectsHTML = data.projects ? this.generateExperienceHTML(data.projects, 'experience') : '';
        const certificationsHTML = this.generateCertificationsHTML(data.certifications);
        const activitiesHTML = this.generateActivitiesHTML(data.activities);

        return `
            <div class="resume-header">
                <h1>${data.personal.name || ''}</h1>
                <p>${data.personal.title || ''}</p>
            </div>
            <div class="resume-body">
                <div class="sidebar">
                    ${contactHTML ? `
                    <div class="section">
                        <h3 class="section-title">联系方式</h3>
                        ${contactHTML}
                    </div>
                    ` : ''}
                    
                    ${data.skills && data.skills.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">技能专长</h3>
                        ${skillsHTML}
                    </div>
                    ` : ''}
                    
                    ${data.certifications && data.certifications.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">证书认证</h3>
                        ${certificationsHTML}
                    </div>
                    ` : ''}
                </div>
                <div class="main-content-area">
                    ${data.summary ? `
                    <div class="section">
                        <h3 class="section-title">个人简介</h3>
                        <p>${this.formatTextWithLineBreaks(data.summary)}</p>
                    </div>
                    ` : ''}
                    
                    ${data.education && data.education.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">教育背景</h3>
                        ${educationHTML}
                    </div>
                    ` : ''}
                    
                    ${data.experience && data.experience.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">项目经历</h3>
                        ${experienceHTML}
                    </div>
                    ` : ''}
                    
                    ${data.projects && data.projects.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">个人项目</h3>
                        ${projectsHTML}
                    </div>
                    ` : ''}
                    
                    ${data.activities && data.activities.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">校园活动</h3>
                        ${activitiesHTML}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    
    template2: function(data) {
        const contactHTML = this.generateContactHTML(data.personal);
        const skillsHTML = this.generateSkillsHTML(data.skills);
        const experienceHTML = this.generateExperienceHTML(data.experience);
        const educationHTML = this.generateExperienceHTML(data.education, 'education');
        const projectsHTML = data.projects ? this.generateExperienceHTML(data.projects, 'experience') : '';
        const certificationsHTML = this.generateCertificationsHTML(data.certifications);
        const activitiesHTML = this.generateActivitiesHTML(data.activities);

        return `
            <div class="resume-header">
                <h1>${data.personal.name || ''}</h1>
                <p>${data.personal.title || ''}</p>
                <div class="contact-info">
                    ${data.personal.phone ? `<span><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                    ${data.personal.email ? `<span><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                    ${data.personal.address ? `<span><i class="fas fa-map-marker-alt"></i> ${data.personal.address}</span>` : ''}
                </div>
            </div>
            <div class="resume-body">
                ${data.summary ? `
                <div class="section">
                    <h3 class="section-title">个人简介</h3>
                    <p>${this.formatTextWithLineBreaks(data.summary)}</p>
                </div>
                ` : ''}
                
                ${data.education && data.education.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">教育背景</h3>
                    ${educationHTML}
                </div>
                ` : ''}
                
                ${data.experience && data.experience.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">项目经历</h3>
                    ${experienceHTML}
                </div>
                ` : ''}
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">技能专长</h3>
                    ${skillsHTML}
                </div>
                ` : ''}
                
                ${data.projects && data.projects.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">个人项目</h3>
                    ${projectsHTML}
                </div>
                ` : ''}
                
                ${data.certifications && data.certifications.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">证书认证</h3>
                    ${certificationsHTML}
                </div>
                ` : ''}
                
                ${data.activities && data.activities.length > 0 ? `
                <div class="section">
                    <h3 class="section-title">校园活动</h3>
                    ${activitiesHTML}
                </div>
                ` : ''}
            </div>
        `;
    },

    
    template3: function(data) {
        const contactHTML = this.generateContactHTML(data.personal);
        const skillsHTML = this.generateSkillsHTML(data.skills);
        const experienceHTML = this.generateExperienceHTML(data.experience);
        const educationHTML = this.generateExperienceHTML(data.education, 'education');
        const projectsHTML = data.projects ? this.generateExperienceHTML(data.projects, 'experience') : '';
        const certificationsHTML = this.generateCertificationsHTML(data.certifications);
        const activitiesHTML = this.generateActivitiesHTML(data.activities);

        return `
            <div class="resume-header">
                <div>
                    <h1>${data.personal.name || ''}</h1>
                    <p>${data.personal.title || ''}</p>
                </div>
                <div class="contact-info">
                    ${data.personal.phone ? `<span><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                    ${data.personal.email ? `<span><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                </div>
            </div>
            <div class="resume-body">
                <div class="main-content-area">
                    ${data.summary ? `
                    <div class="section">
                        <h3 class="section-title">职业概述</h3>
                        <p>${this.formatTextWithLineBreaks(data.summary)}</p>
                    </div>
                    ` : ''}
                    
                    ${data.education && data.education.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">教育背景</h3>
                        ${educationHTML}
                    </div>
                    ` : ''}
                    
                    ${data.experience && data.experience.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">项目经历</h3>
                        ${experienceHTML}
                    </div>
                    ` : ''}
                    
                    ${data.projects && data.projects.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">个人项目</h3>
                        ${projectsHTML}
                    </div>
                    ` : ''}
                    
                    ${data.activities && data.activities.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">校园活动</h3>
                        ${activitiesHTML}
                    </div>
                    ` : ''}
                </div>
                <div class="sidebar">
                    ${contactHTML ? `
                    <div class="section">
                        <h3 class="section-title">联系信息</h3>
                        ${contactHTML}
                    </div>
                    ` : ''}
                    
                    ${data.skills && data.skills.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">专业技能</h3>
                        ${skillsHTML}
                    </div>
                    ` : ''}
                    
                    ${data.certifications && data.certifications.length > 0 ? `
                    <div class="section">
                        <h3 class="section-title">证书认证</h3>
                        ${certificationsHTML}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
};