# -*- coding: utf-8 -*-
import os
import re

# 确保在项目根目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 读取文件
with open('frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
with open('frontend/css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()
with open('frontend/js/api.js', 'r', encoding='utf-8') as f:
    api = f.read()
with open('frontend/js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()
with open('frontend/js/charts.js', 'r', encoding='utf-8') as f:
    charts = f.read()
with open('frontend/js/export.js', 'r', encoding='utf-8') as f:
    export = f.read()
with open('frontend/js/fx-attribution.js', 'r', encoding='utf-8') as f:
    fx_attr = f.read()
with open('frontend/js/fx-charts.js', 'r', encoding='utf-8') as f:
    fx_charts = f.read()
with open('frontend/js/fx-export.js', 'r', encoding='utf-8') as f:
    fx_export = f.read()
with open('frontend/js/fx-drilldown.js', 'r', encoding='utf-8') as f:
    fx_drill = f.read()
with open('frontend/js/fx-trend-chart.js', 'r', encoding='utf-8') as f:
    fx_trend = f.read()

# 提取body并移除script标签
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
body = body_match.group(1) if body_match else ''
body = re.sub(r'<script src="js/[^"]+"></script>', '', body)

# 构建HTML
output = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金融市场业务管理系统5.0</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.0/index.min.js"></script>
    <style>
{css}
    </style>
</head>
<body>
{body}
    <script>
{api}
    </script>
    <script>
{app}
    </script>
    <script>
{charts}
    </script>
    <script>
{export}
    </script>
    <script>
{fx_attr}
    </script>
    <script>
{fx_charts}
    </script>
    <script>
{fx_export}
    </script>
    <script>
{fx_drill}
    </script>
    <script>
{fx_trend}
    </script>
</body>
</html>
"""

# 写入文件
with open('金融市场业务管理系统5.0.html', 'w', encoding='utf-8') as f:
    f.write(output)

print('✅ 已生成: 金融市场业务管理系统5.0.html')
print(f'📦 大小: {os.path.getsize("金融市场业务管理系统5.0.html") / 1024 / 1024:.2f} MB')



