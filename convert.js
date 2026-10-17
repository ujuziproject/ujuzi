const fs = require('fs');

function convertHtmlToJsx(html) {
  return html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
    .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
    .replace(/style="([^"]*)"/g, (match, styleString) => {
      const styles = styleString.split(';').filter(s => s.trim() !== '').reduce((acc, style) => {
        let [key, value] = style.split(':').map(s => s.trim());
        if (key && value) {
          key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          acc[key] = value;
        }
        return acc;
      }, {});
      return `style={${JSON.stringify(styles)}}`;
    });
}
