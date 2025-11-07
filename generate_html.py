#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(base_dir)

# 读取所有文件
html = open('frontend/index.html', 'r', encoding='utf-8').read()
css = open('frontend/css/styles.css', 'r', encoding='utf-8').read()
api = open('frontend/js/api.js', 'r', encoding='utf-8').read()
app = open('frontend/js/app.js', 'r', encoding='utf-8').read()
charts = open('frontend/js/charts.js', 'r', encoding='utf-8').read()
fx_attr = open('frontend/js/fx-attribution.js', 'r', encoding='utf-8').read()
fx_charts = open('frontend/js/fx-charts.js', 'r', encoding='utf-8').read()
fx_drill = open('frontend/js/fx-drilldown.js', 'r', encoding='utf-8').read()
fx_trend = open('frontend/js/fx-trend-chart.js', 'r', encoding='utf-8').read()

# 移除外部CSS和JS引用
html = re.sub(r'<link rel="stylesheet"[^>]+>', '', html)
html = re.sub(r'<script src="js/[^"]+"></script>', '', html)
html = re.sub(r'<title>[^<]+</title>', '<title>金融市场业务管理系统5.0</title>', html)

# 提取body内容
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
body = body_match.group(1) if body_match else ''

# 构建完整HTML
full_html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金融市场业务管理系统5.0</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
{css}
    </style>
</head>
<body>
{body}
    <script>
/* api.js */
{api}

/* app.js */
{app}

/* charts.js */
{charts}

/* fx-attribution.js */
{fx_attr}

/* fx-charts.js */
{fx_charts}

/* fx-drilldown.js */
{fx_drill}

/* fx-trend-chart.js */
{fx_trend}
    </script>
</body>
</html>'''

# 保存文件
output_file = '金融市场业务管理系统5.0.html'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(full_html)

size = os.path.getsize(output_file)
print(f'✅ 成功生成独立HTML文件: {output_file}')
print(f'📦 文件大小: {size/1024/1024:.2f} MB')
print(f'\n⚠️  重要提示:')
print(f'   1. 此文件包含所有前端代码，可以直接在浏览器中打开')
print(f'   2. 但后端API服务仍然需要运行（默认地址: http://localhost:8002）')
print(f'   3. 如需修改API地址，请编辑文件中的 API_BASE_URL 变量')




