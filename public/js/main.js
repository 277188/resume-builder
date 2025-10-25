
document.addEventListener('DOMContentLoaded', function() {
    ResumeGenerator.init();
    FeedbackSystem.init();
    

    setTimeout(() => {
        FeedbackSystem.showToast('欢迎使用简历生成器！');
    }, 1000);
    

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            ResumeGenerator.exportToPDF();
        }
        
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
        
  
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            document.getElementById('admin-btn').style.display = 'flex';
            FeedbackSystem.showToast('管理员模式已启用');
        }
    });
    
    window.addEventListener('beforeunload', function(e) {
        // 可以在这里添加保存提示
        // e.preventDefault();
        // e.returnValue = '';
    });
});