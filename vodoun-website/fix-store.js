import fs from 'fs';

const file = 'src/store.jsx';
let content = fs.readFileSync(file, 'utf8');

// Regex to capture the key (story|description|name) and its content inside single quotes
// We look for: spaces `key: 'content',`
content = content.replace(/^(\s*(?:story|description|name):\s*)'(.*?)'(,?)\s*$/gm, (match, prefix, innerText, suffix) => {
    // If the inner text has unescaped single quotes, or just to be safe, replace with backticks
    return `${prefix}\`${innerText}\`${suffix}`;
});

fs.writeFileSync(file, content);
console.log('Fixed quotes in store.jsx');
