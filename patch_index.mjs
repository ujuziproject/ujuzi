import fs from 'fs';
let c = fs.readFileSync('index.html', 'utf-8');

c = c.replace(
  '<title>uJuzi</title>',
  "<title>uJuzi</title>\n    <script>\n      if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {\n        document.documentElement.classList.add('dark');\n      } else {\n        document.documentElement.classList.remove('dark');\n      }\n    </script>"
);

fs.writeFileSync('index.html', c);
