#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成独立的单文件HTML"""
import os
import re

# 读取文件
base_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(base_dir, 'frontend')

# 读取所有文件
with open(os.path.join(frontend_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(os.path.join(frontend_dir, 'css', 'styles.css'), 'r', encoding='utf-8') as f:
    css_content = f.read()

with open(os.path.join(frontend_dir, 'js', 'api.js'), 'r', encoding='utf-8') as f:
    api_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
    app_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'charts.js'), 'r', encoding='utf-8') as f:
    charts_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'export.js'), 'r', encoding='utf-8') as f:
    export_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'fx-attribution.js'), 'r', encoding='utf-8') as f:
    fx_attribution_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'fx-charts.js'), 'r', encoding='utf-8') as f:
    fx_charts_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'fx-export.js'), 'r', encoding='utf-8') as f:
    fx_export_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'fx-drilldown.js'), 'r', encoding='utf-8') as f:
    fx_drilldown_js = f.read()

with open(os.path.join(frontend_dir, 'js', 'fx-trend-chart.js'), 'r', encoding='utf-8') as f:
    fx_trend_chart_js = f.read()

# 提取body内容（移除script标签）
body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
if body_match:
    body_content = body_match.group(1)
    # 移除所有script标签
    body_content = re.sub(r'<script src="js/[^"]+"></script>', '', body_content)
else:
    body_content = html_content

# 提取head内容
head_match = re.search(r'<head[^>]*>(.*?)</head>', html_content, re.DOTALL)
if head_match:
    head_content = head_match.group(1)
    # 移除CSS链接，保留Chart.js和date-fns
    head_content = re.sub(r'<link rel="stylesheet"[^>]+>', '', head_content)
else:
    head_content = ''

# 构建完整的HTML
standalone_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金融市场业务管理系统5.0</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.0/index.min.js"></script>
    <style>
{css_content}
    </style>
</head>
<body>
{body_content}
    <script>
{api_js}
    </script>
    <script>
{app_js}
    </script>
    <script>
{charts_js}
    </script>
    <script>
{export_js}
    </script>
    <script>
{fx_attribution_js}
    </script>
    <script>
{fx_charts_js}
    </script>
    <script>
{fx_export_js}
    </script>
    <script>
{fx_drilldown_js}
    </script>
    <script>
{fx_trend_chart_js}
    </script>
</body>
</html>
"""

# 写入文件
output_file = os.path.join(base_dir, '金融市场业务管理系统5.0.html')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(standalone_html)

print(f"✅ 已生成独立HTML文件: {output_file}")
print(f"📦 文件大小: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")



