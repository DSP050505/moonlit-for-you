const fs = require('fs');
const path = require('path');

/**
 * Mega Patcher for Expo/Metro compatibility.
 * 1. Removes "exports" from all package.json files.
 * 2. Copies "src" to "private" for metro and metro-core.
 * 3. Replaces all "/private/" imports with "/src/" in JS files.
 */

function patchNodeModules(dir) {
    if (dir.includes('.bin')) return;
    
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            patchNodeModules(fullPath);
            
            // Special folder copy for metro aliases
            if (file === 'metro-core' || file === 'metro') {
                const srcPath = path.join(fullPath, 'src');
                const privatePath = path.join(fullPath, 'private');
                if (fs.existsSync(srcPath) && !fs.existsSync(privatePath)) {
                    console.log(`📂 Creating ${file}/private alias...`);
                    fs.cpSync(srcPath, privatePath, { recursive: true });
                }
            }
        } else if (file === 'package.json') {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const json = JSON.parse(content);
                if (json.exports) {
                    console.log(`🗑️ Removing strict exports: ${json.name || fullPath}`);
                    delete json.exports;
                    fs.writeFileSync(fullPath, JSON.stringify(json, null, 2));
                }
            } catch (err) {}
        } else if (file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('/private/')) {
                    console.log(`✏️ Patching alias in: ${fullPath}`);
                    const newContent = content.replace(/([a-z0-9-]+)\/private/g, '$1/src');
                    fs.writeFileSync(fullPath, newContent);
                }
            } catch (err) {}
        }
    }
}

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('👷 Running Node Compatibility Mega Patch...');
    patchNodeModules(nodeModulesPath);
    console.log('✅ Mega Patch applied successfully!');
}
