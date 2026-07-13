import os, shutil

php_dir = r'C:\php84'
php_ini = os.path.join(php_dir, 'php.ini')
ext_path = os.path.join(php_dir, 'ext')

shutil.copy(os.path.join(php_dir, 'php.ini-production'), php_ini)

with open(php_ini, 'r') as f:
    content = f.read()

content = content.replace(';extension_dir = "ext"', 'extension_dir = "' + ext_path.replace('\\', '\\\\') + '"')

extensions = ['openssl', 'curl', 'pdo_mysql', 'mbstring', 'xml', 'ctype', 'fileinfo', 'pdo_sqlite', 'tokenizer', 'intl', 'sodium', 'dom', 'simplexml']
for ext in extensions:
    content = content.replace(';extension=' + ext, 'extension=' + ext)

with open(php_ini, 'w') as f:
    f.write(content)

print('Done')
