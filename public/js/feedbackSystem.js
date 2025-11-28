const FeedbackSystem = {
    send: async function(content, contact='') {
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, contact, timestamp: new Date().toISOString() })
        });
        return res.ok;
      } catch (err) {
        console.error('反馈发送失败', err);
        return false;
      }
    }
};
