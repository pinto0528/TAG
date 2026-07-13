import os, shutil

php_dir = r'C:\Users\nclpn\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe'
php_ini = os.path.join(php_dir, 'php.ini')
ext_path = os.path.join(php_dir, 'ext')

shutil.copy(os.path.join(php_dir, 'php.ini-production'), php_ini)

with open(php_ini, 'r') as f:
    content = f.read()

ext_path_escaped = ext_path.replace('\\', '\\\\')
content = content.replace(';extension_dir = "ext"', 'extension_dir = "' + ext_path_escaped + '"')

extensions = ['openssl', 'curl', 'pdo_mysql', 'mbstring', 'xml', 'ctype', 'fileinfo', 'pdo_sqlite', 'tokenizer', 'intl', 'sodium', 'dom', 'simplexml']
for ext in extensions:
    content = content.replace(';extension=' + ext, 'extension=' + ext)

with open(php_ini, 'w') as f:
    f.write(content)

print('Done - extension_dir:', ext_path)
