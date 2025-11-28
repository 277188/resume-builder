class ResumeGenerator {
    constructor() {
      this.data = {
        avatar: null, // 新增：头像 DataURL
        personal: {},
        education: [],
        work: [],
        skills: '',
        custom: [],
        summary: '',
        sectionOrder: [] 
      };
      this.currentTemplate = 'template1';
    }
  
    collectData() {
      // 注意：Avatar 由 main.js 直接写入 this.data.avatar，这里不做读取操作，以免覆盖
      
      this.data.personal = {
        name: document.getElementById('name')?.value || '您的姓名',
        jobTitle: document.getElementById('jobTitle')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        website: document.getElementById('website')?.value || '',
        location: document.getElementById('location')?.value || '',
      };
      this.data.summary = document.getElementById('summary')?.value || '';
      this.data.skills = document.getElementById('skills')?.value || '';
  
      this.data.work = [];
      document.querySelectorAll('#work-list .dynamic-form-item').forEach(item => {
        this.data.work.push({
          id: item.dataset.id,
          company: item.querySelector('.inp-company')?.value || '',
          role: item.querySelector('.inp-role')?.value || '',
          date: item.querySelector('.inp-date')?.value || '',
          description: item.querySelector('.inp-desc')?.value || ''
        });
      });
  
      this.data.education = [];
      document.querySelectorAll('#education-list .dynamic-form-item').forEach(item => {
        this.data.education.push({
          id: item.dataset.id,
          school: item.querySelector('.inp-school')?.value || '',
          degree: item.querySelector('.inp-degree')?.value || '',
          year: item.querySelector('.inp-year')?.value || ''
        });
      });
        
      this.data.honors = [];
      document.querySelectorAll('#honors-list .dynamic-form-item').forEach(item => {
        this.data.honors.push({
          id: item.dataset.id,
          title: item.querySelector('.inp-title')?.value || '',
          date: item.querySelector('.inp-date')?.value || '',
          description: item.querySelector('.inp-desc')?.value || ''
        });
      });
      
      this.data.custom = [];
      document.querySelectorAll('.editor-section[data-type="custom"]').forEach(section => {
          this.data.custom.push({
              elementId: section.id,
              title: section.querySelector('.custom-title')?.value || '',
              content: section.querySelector('.custom-content')?.value || ''
          });
      });

      this.data.sectionOrder = [];
      document.querySelectorAll('#draggable-sections .draggable-item').forEach(el => {
          this.data.sectionOrder.push({ type: el.dataset.type, id: el.id });
      });
  
      this.render();
    }
  
    render() {
      const previewDiv = document.getElementById('resume-preview');
      if (!previewDiv) return;
      previewDiv.className = 'resume-paper ' + this.currentTemplate;
      if (TemplateEngine[this.currentTemplate]) {
          previewDiv.innerHTML = TemplateEngine[this.currentTemplate](this.data);
      }
    }
  
    setTemplate(name) {
      this.currentTemplate = name;
      this.render();
    }
  
    exportPDF() {
      const element = document.getElementById('resume-preview');
      const isDarkMode = document.body.classList.contains('dark-mode');
      if (isDarkMode) {
          document.body.classList.remove('dark-mode');
          element.style.color = '#000'; 
          element.style.background = '#fff';
      }

      const opt = {
        margin: 0,
        filename: `Resume_${this.data.personal.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
          if (isDarkMode) document.body.classList.add('dark-mode');
          setTimeout(() => {
             // 导出后的感谢弹窗
             alert('✨ 导出成功！\n\n感谢您的使用，如果喜欢，请前往 GitHub 给 resume-builder 一个 Star！');
          }, 1000);
      });
    }
}
