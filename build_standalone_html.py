#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成独立的单文件HTML，合并所有前端资源
"""
import os
import re

def read_file(filepath):
    """读取文件内容"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"读取文件失败 {filepath}: {e}")
        return None

def extract_inline_scripts(html_content):
    """提取HTML中的内联脚本，保留外部脚本引用"""
    # 匹配外部脚本标签
    external_scripts = re.findall(r'<script\s+src="([^"]+)"[^>]*></script>', html_content)
    # 移除所有script标签（包括内联和外部）
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
    return html_content, external_scripts

def build_standalone_html():
    """构建独立的HTML文件"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, 'frontend')
    
    # 读取HTML文件
    html_file = os.path.join(frontend_dir, 'index.html')
    html_content = read_file(html_file)
    if not html_content:
        return False
    
    # 提取外部脚本引用
    html_content, external_scripts = extract_inline_scripts(html_content)
    
    # 移除外部CSS引用
    html_content = re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"[^>]*>', '', html_content)
    
    # 读取CSS文件
    css_file = os.path.join(frontend_dir, 'css', 'styles.css')
    css_content = read_file(css_file)
    if not css_content:
        return False
    
    # 读取所有JavaScript文件
    js_files = [
        ('api.js', os.path.join(frontend_dir, 'js', 'api.js')),
        ('app.js', os.path.join(frontend_dir, 'js', 'app.js')),
        ('charts.js', os.path.join(frontend_dir, 'js', 'charts.js')),
        ('fx-attribution.js', os.path.join(frontend_dir, 'js', 'fx-attribution.js')),
        ('fx-charts.js', os.path.join(frontend_dir, 'js', 'fx-charts.js')),
        ('fx-drilldown.js', os.path.join(frontend_dir, 'js', 'fx-drilldown.js')),
        ('fx-trend-chart.js', os.path.join(frontend_dir, 'js', 'fx-trend-chart.js')),
    ]
    
    js_contents = []
    for name, filepath in js_files:
        content = read_file(filepath)
        if content:
            js_contents.append(f"/* {name} */\n{content}")
        else:
            print(f"警告: 无法读取 {filepath}")
    
    # 构建完整的HTML
    standalone_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金融市场业务管理系统5.0</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
{css_content}
    </style>
</head>
<body>
{html_content}
    <script>
{chr(10).join(js_contents)}
    </script>
</body>
</html>"""
    
    # 保存文件
    output_file = os.path.join(base_dir, '金融市场业务管理系统5.0.html')
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(standalone_html)
        print(f"✅ 成功生成独立HTML文件: {output_file}")
        print(f"📦 文件大小: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")
        print(f"\n⚠️  重要提示:")
        print(f"   1. 此文件包含所有前端代码，可以直接在浏览器中打开")
        print(f"   2. 但后端API服务仍然需要运行（默认地址: http://localhost:8002）")
        print(f"   3. 如需修改API地址，请编辑文件中的 API_BASE_URL 变量")
        return True
    except Exception as e:
        print(f"❌ 保存文件失败: {e}")
        return False

if __name__ == '__main__':
    build_standalone_html()



