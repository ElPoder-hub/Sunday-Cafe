# Собирает SUNDAY-site.html (всё в одном файле) и SUNDAY-artifact.html из index.html
import re,base64
def b(p):
    m={'jpg':'image/jpeg','svg':'image/svg+xml','woff':'font/woff'}[p.rsplit('.',1)[1]]
    return f"data:{m};base64,"+base64.b64encode(open(p,'rb').read()).decode()
css=re.sub(r'url\((fonts/[^)]+)\)',lambda m:f"url({b(m.group(1))})",open('style.css',encoding='utf8').read())
js=open('app.js',encoding='utf8').read()
h=open('index.html',encoding='utf8').read()
h=h.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script src="app.js"></script>','<script>'+js+'</script>')
h=h.replace('<link rel="icon" href="favicon.svg" type="image/svg+xml">','<link rel="icon" href="'+b('favicon.svg')+'">')
h=re.sub(r'src="(img/[^"]+)"',lambda m:f'src="{b(m.group(1))}"',h)
h=re.sub(r'"src":"(img/[^"]+)"',lambda m:f'"src":"{b(m.group(1))}"',h)
open('SUNDAY-site.html','w',encoding='utf8').write(h)
a=re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>','',h,flags=re.I)
a=re.sub(r'<meta charset[^>]*>\s*<meta name="viewport"[^>]*>\s*','',a)
a=re.sub(r'<meta name="theme-color"[^>]*>\s*','',a);a=re.sub(r'<link rel="icon"[^>]*>\s*','',a)
for t in ['</head>','<body>','</body>','</html>']:a=a.replace(t,'')
a=a.replace('<title>SUNDAY — кафе в Жаркенте, где всем рады</title>','<title>SUNDAY Жаркент</title>')
open('SUNDAY-artifact.html','w',encoding='utf8').write(a)
print('ok',len(h)//1024,'KB')
