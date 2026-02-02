# XiaoqiangClub 文章投稿指南

感谢您对 XiaoqiangClub 的关注！本指南将详细介绍如何创建新的文章、文章的存放位置以及访问路径的解析方法。本项目采用 Jekyll 静态网站生成器，支持文档页面和独立页面的创建方式。

## 一、项目目录结构

在开始创建文章之前，首先需要了解本项目的目录结构。本项目是一个轻量级的静态网站，主要包含以下目录和文件：

```
xiaoqiangclub.github.io/
├── _includes/          # 包含文件，用于页面组件复用
│   └── head-custom.html
├── _layouts/           # 布局模板，定义页面的整体结构
│   └── doc.html        # 文档页面布局（我们新增的现代化布局）
├── _sass/              # SCSS 样式文件
│   └── markdown-enhanced.scss
├── assets/             # 静态资源目录
│   └── css/
│       └── markdown-enhanced.css  # 现代化 Markdown 渲染样式
├── docs/               # 📁 文档文章存放目录（主要）
│   └── wechat-token-hub.md
├── images/             # 图片资源目录
├── archives/           # 归档页面
├── md/                 # 静态页面资源（由其他工具生成）
├── index.html          # 网站首页（导航页）
├── 26words.html        # 独立功能页面
├── 404.html            # 404 错误页面
├── _config.yml         # Jekyll 配置文件
└── CONTRIBUTING.md     # 本投稿指南文件
```

## 二、文章存放位置说明

本项目主要使用以下两种方式存放文章内容，每种方式适用于不同的场景和用途。

### 2.1 文档目录（docs）

`docs` 目录是本项目存放文章的主要位置，适用于技术文档、项目说明、教程指南等各类内容。该目录下的文章会自动应用我们新增的现代化渲染样式，提供优秀的阅读体验。

```
docs/
├── wechat-token-hub.md    # 微信公众号 Token 管理服务文档
├── python-tutorial.md     # Python 教程（示例）
├── docker-guide.md        # Docker 使用指南（示例）
└── project-alpha.md       # 项目说明文档（示例）
```

文件命名规范：建议使用有意义的英文名称，使用连字符连接单词，避免使用中文文件名。例如，使用 `python-basics.md` 而不是 `Python基础教程.md`。

文件名会直接参与 URL 路径的生成。例如，`docs/wechat-token-hub.md` 对应的访问路径为 `/docs/wechat-token-hub/`。

### 2.2 根目录独立页面

对于特殊的独立页面，如「关于我」「使用条款」「留言板」等，可以直接将 Markdown 文件或 HTML 文件放置在项目根目录下。

```
├── index.html          # 网站首页（导航页）
├── about.md            # 关于页面（需要手动创建）
├── contact.md          # 联系页面（需要手动创建）
└── privacy.md          # 隐私政策页面（需要手动创建）
```

根目录下的 Markdown 文件和 HTML 文件会直接以文件名作为访问路径。例如，`about.md` 对应的访问路径为 `/about/`。

### 2.3 目录选择建议

如果您的内容是技术文档、项目说明、教程指南等结构化内容，建议使用 `docs` 目录。该目录下的文章会应用专门的文档布局和渲染样式，提供更好的阅读体验。

如果您的内容是简单的独立页面，如「关于我」「联系页」等，可以直接放在根目录下。这种方式简单直接，适合内容较少的页面。

## 三、如何创建新文章

在 `docs` 目录中创建新的 Markdown 文件即可开始写作。以下是创建一篇标准文档文章的完整步骤和详细说明。

### 3.1 创建新文件

在 `docs` 目录下创建一个新的 Markdown 文件，文件名建议使用有意义的英文名称。以下是一个完整的示例：

````markdown
---
title: Python 入门完全指南
date: 2024-03-25 10:30:00 +0800
description: 本文将详细介绍 Python 编程语言的入门知识，包括环境搭建、基础语法、常用库介绍等内容，适合零基础学习者阅读。
---

# Python 入门完全指南

Python 是一门优雅且强大的编程语言，它以其简洁易懂的语法和丰富的生态系统而受到广泛欢迎。无论您是编程新手还是经验丰富的开发者，Python 都能为您提供高效的开发体验。

## 为什么选择 Python

Python 在多个领域都有出色的表现，这也是它成为最受欢迎编程语言之一的原因。以下是 Python 的主要优势：

首先，Python 的语法简洁明了，代码可读性高。与其他语言相比，Python 使用更少的代码行数完成相同的任务，这使得开发和维护成本大大降低。

其次，Python 拥有庞大的标准库和第三方生态系统。无论是 Web 开发、数据分析、人工智能还是自动化脚本，Python 都有成熟的解决方案。

第三，Python 社区活跃，资源丰富。您可以轻松找到各种教程、文档和开源项目来学习和参考。

## 环境搭建

在开始 Python 编程之前，需要先搭建开发环境。以下是在不同操作系统上安装 Python 的方法。

### Windows 系统安装

访问 Python 官方网站 https://www.python.org/downloads/ 下载最新版本的 Python 安装包。运行安装程序时，请务必勾选「Add Python to PATH」选项。

### macOS 系统安装

macOS 通常预装了 Python 2，但建议安装 Python 3 以获得更好的支持和最新的功能：

```bash
# 使用 Homebrew 安装
brew install python3

# 验证安装
python3 --version
```
````

### Linux 系统安装

大多数 Linux 发行版都默认安装了 Python 3。如果需要手动安装：

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install python3 python3-pip

# CentOS / RHEL
sudo yum install python3
```

## 第一个 Python 程序

安装完成后，让我们来编写第一个 Python 程序。创建一个名为 `hello.py` 的文件，输入以下代码：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def greet(name):
    """向用户发送问候信息"""
    return f"Hello, {name}! Welcome to Python world."

if __name__ == "__main__":
    # 获取用户名并打印问候信息
    username = input("请输入您的名字: ")
    print(greet(username))
```

运行这个程序：

```bash
python3 hello.py
```

## 基础语法

Python 的语法简洁明了，下面介绍一些基本概念。

### 变量和数据类型

Python 是动态类型语言，变量不需要声明类型，可以直接赋值：

```python
# 字符串
name = "Xiaoqiang"
language = 'Python'

# 数字
age = 25
height = 175.5

# 布尔值
is_developer = True

# 列表
skills = ["Python", "JavaScript", "Docker"]

# 字典
profile = {
    "name": "Xiaoqiang",
    "age": 25,
    "skills": skills
}
```

### 条件判断

使用 `if-elif-else` 结构进行条件判断：

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"

print(f"您的等级是: {grade}")
```

### 循环结构

Python 支持 `for` 循环和 `while` 循环：

```python
# for 循环遍历列表
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)

# 使用 range() 生成序列
for i in range(1, 6):
    print(f"第 {i} 次循环")

# while 循环
count = 0
while count < 5:
    print(count)
    count += 1
```

### 函数定义

使用 `def` 关键字定义函数：

```python
def calculate_area(radius):
    """计算圆的面积"""
    pi = 3.14159
    return pi * radius ** 2

# 调用函数
area = calculate_area(5)
print(f"半径为 5 的圆面积为: {area}")
```

## 常用库介绍

Python 拥有丰富的标准库和第三方库，以下是一些常用库的简介。

### 标准库

Python 标准库包含了大量实用的模块，无需额外安装即可使用：

- `os` - 操作系统相关功能
- `sys` - 系统相关参数和函数
- `datetime` - 日期和时间处理
- `json` - JSON 数据格式处理
- `re` - 正则表达式
- `math` - 数学函数

### 第三方库

通过 pip 包管理器可以安装丰富的第三方库：

```bash
# Web 开发
pip install flask django fastapi

# 数据分析
pip install pandas numpy matplotlib

# 机器学习
pip install scikit-learn torch tensorflow
```

## 学习资源推荐

学习 Python 的过程中，善用优质的学习资源可以事半功倍。以下是一些推荐的学习资源：

官方文档是学习 Python 最好的起点，内容权威且全面。访问 https://docs.python.org/3/ 获取最新的 Python 3 官方文档。

Real Python 网站提供了大量高质量的 Python 教程，适合各个水平的学习者。访问 https://realpython.com/ 探索更多内容。

## 总结

本文介绍了 Python 的基础知识和入门方法，希望能够帮助您快速开始 Python 编程之旅。Python 是一门值得深入学习的语言，它在 Web 开发、数据科学、人工智能等领域都有广泛的应用。

建议您在学习过程中多动手实践，通过编写实际的代码项目来巩固所学知识。祝您学习愉快！

````

### 3.2 Front Matter 字段说明

Front Matter 是位于 Markdown 文件顶部的 YAML 格式元数据块，用于定义文章的属性。以下是常用字段的详细说明和使用建议。

`title` 字段用于指定文章的标题，该标题会显示在页面标题栏和文章正文顶部。建议使用简洁明了的中文标题，长度控制在 50 个字符以内。例如：「Python 入门完全指南」。

`date` 字段用于指定文章的发布日期，格式为 `YYYY-MM-DD HH:MM:SS +0800`。这个日期主要用于文章排序和元数据记录，虽然文档不像博客文章那样按时间线展示，但保留日期信息有助于追溯内容更新时间。

`description` 字段用于提供文章的简要描述，建议控制在 150-200 字以内。这个描述会用于 SEO 优化，帮助搜索引擎理解文章内容，同时在社交媒体分享时显示为摘要信息。

`layout` 字段用于指定文章使用的布局模板。本项目为 `docs` 目录下的文章预设了 `doc` 布局，会自动应用现代化渲染样式，因此通常不需要手动指定此字段。如果确实需要使用其他布局，可以设置 `layout: page` 或 `layout: default`。

### 3.3 推荐的 Front Matter 格式

以下是推荐的 Front Matter 格式，包含最常用的字段：

```markdown
---
title: 文章标题
date: 2024-03-25 10:30:00 +0800
description: 文章的简要描述，用于 SEO 和分享预览。建议控制在 150-200 字以内。
---
````

如果文章需要自定义访问路径，可以添加 `permalink` 字段：

```markdown
---
title: 自定义页面
date: 2024-03-25 10:30:00 +0800
description: 这是一篇使用自定义路径的文章
permalink: /my-custom-path/
---
```

## 四、访问路径解析

理解文章的访问路径对于正确设置文章链接和导航非常重要。以下是不同类型文章的访问路径规则说明。

### 4.1 文档页面访问路径

存放在 `docs` 目录中的 Markdown 文件，其访问路径格式为 `/docs/文件名/`。文件名不包含扩展名 `.md`，连字符会保留在 URL 中。

例如，以下文件对应所示的访问路径：

| 文件位置                   | 文件名           | 访问路径                  |
| -------------------------- | ---------------- | ------------------------- |
| `docs/wechat-token-hub.md` | wechat-token-hub | `/docs/wechat-token-hub/` |
| `docs/python-basics.md`    | python-basics    | `/docs/python-basics/`    |
| `docs/docker-guide.md`     | docker-guide     | `/docs/docker-guide/`     |

完整的访问 URL 格式为：`https://xiaoqiangclub.github.io/docs/文件名/`。

### 4.2 独立页面访问路径

根目录下的 Markdown 文件和 HTML 文件会直接以文件名作为访问路径。文件扩展名会被移除，路径最后带有斜杠。

例如，以下文件对应所示的访问路径：

| 文件位置       | 文件名  | 访问路径    |
| -------------- | ------- | ----------- |
| `about.md`     | about   | `/about/`   |
| `contact.md`   | contact | `/contact/` |
| `26words.html` | 26words | `/26words/` |
| `index.html`   | index   | `/`         |

### 4.3 自定义访问路径

如果自动生成的 URL 不符合您的需求，可以使用 Front Matter 中的 `permalink` 字段自定义文章访问路径。permalink 可以设置为任意有效的 URL 路径。

以下是自定义路径的示例：

```markdown
---
title: Python 教程
date: 2024-03-25 10:30:00 +0800
description: Python 入门教程
permalink: /tutorials/python/
---
```

这样设置后，这篇文章的访问路径将变为 `/tutorials/python/` 而不是 `/docs/python-tutorial/`。自定义路径非常灵活，可以使用任何有意义的 URL 结构来组织您的内容。

### 4.4 访问路径汇总表

以下表格汇总了不同类型文件的存放位置和对应的访问路径规则，方便您快速查阅和参考：

| 文件类型 | 存放位置 | 文件命名规范       | 访问路径格式    | 示例 URL                |
| -------- | -------- | ------------------ | --------------- | ----------------------- |
| 文档页面 | `docs/`  | 英文文件名.md      | `/docs/文件名/` | /docs/wechat-token-hub/ |
| 独立页面 | 根目录   | 英文名.md 或 .html | `/文件名/`      | /about/                 |
| 首页     | 根目录   | index.html         | `/`             | /                       |

## 五、图片和资源管理

### 5.1 图片存放位置

网站图片资源存放在 `images` 目录中，您可以在文章中使用相对路径引用图片。引用的语法为 `![图片描述](/images/图片文件名.png)`。

```markdown
![项目截图](/images/project-screenshot.png)

![Logo](/images/logo.png)
```

### 5.2 外部图片引用

除了本地图片，您也可以使用图床服务或 CDN 引用外部图片：

```markdown
![远程图片](https://example.com/image.png)

![Logo](https://s2.loli.net/2025/07/30/Lauge4F7JK2RtEU.png)
```

### 5.3 代码仓库资源

对于需要随文章一起发布的代码文件或其他资源，可以存放在 `assets` 目录中。该目录支持更复杂的文件结构，方便资源分类管理。

```
assets/
├── css/           # 样式文件
├── js/            # JavaScript 文件
└── files/         # 供下载的资源文件
```

在文章中引用方式为：`[下载文件](/assets/files/example.zip)`

## 六、Markdown 语法参考

本项目使用标准的 Markdown 语法进行内容编写，同时支持 GitHub Flavored Markdown (GFM) 的扩展语法。以下是常用语法元素的说明。

### 6.1 标题

使用 `#` 符号创建标题，`#` 的数量表示标题级别：

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

### 6.2 文本格式

```markdown
_斜体文本_
**粗体文本**
**_粗斜体文本_**
~~删除线文本~~
`行内代码`
```

### 6.3 列表

无序列表使用 `-`、`*` 或 `+` 标记：

```markdown
- 第一项
- 第二项
- 第三项
```

有序列表使用数字加句点标记：

```markdown
1. 第一项
2. 第二项
3. 第三项
```

### 6.4 链接和图片

```markdown
[链接文字](https://example.com)

![图片描述](https://example.com/image.png)
```

### 6.5 代码块

使用三个反引号创建代码块，可以指定语言获得语法高亮：

```python
def hello():
    print("Hello, World!")
```

```bash
# 安装依赖
pip install -r requirements.txt

# 运行项目
python app.py
```

````markdown
```yaml
# docker-compose.yml
services:
  web:
    image: nginx
    ports:
      - "80:80"
```
````

### 6.6 引用块

```markdown
> 这是一段引用内容
> 可以跨越多行
```

### 6.7 表格

```markdown
| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
```

### 6.8 分割线

```markdown
---
```

### 6.9 任务列表

```markdown
- [x] 已完成任务
- [ ] 待办任务
- [ ] 另一个待办
```

## 七、创建新文章检查清单

在提交新文章之前，请按照以下清单检查文章内容，确保文章符合质量标准，避免常见问题。

### 7.1 文件位置检查

首先确认文件存放在正确的目录中。文档类文章应放在 `docs` 目录中，独立页面应放在根目录中。确保文件扩展名为 `.md` 而不是 `.markdown`。

### 7.2 文件名检查

检查文件名是否符合规范。建议使用小写英文字母，单词之间使用连字符 `-` 分隔，避免使用中文、空格或特殊字符。例如，推荐的文件名为 `python-basics.md`，不推荐的文件名为 `Python基础教程.md` 或 `Python Basics.md`。

### 7.3 Front Matter 检查

确认 Front Matter 完整且正确。确保包含 `title` 字段，建议添加 `description` 字段。检查 YAML 语法是否正确，特别注意冒号后的空格。示例：

```markdown
---
title: 正确的标题
date: 2024-03-25 10:30:00 +0800
description: 正确的描述
---
```

### 7.4 内容格式检查

确保使用正确的 Markdown 语法。代码块应指定语言标识以获得语法高亮。检查链接和图片路径是否正确。确保标题层级正确使用，不要跳级（如不要从一级直接跳到三级）。

### 7.5 内容质量检查

建议为长文章添加目录结构（可手动添加）。合理使用列表和引用块增强可读性。检查代码示例是否正确且可以正常运行。确保文章内容完整，有适当的总结或结论。

## 八、常见问题解答

### 8.1 文章没有显示怎么办

如果新创建的文章在网站上没有显示，请按以下步骤排查：

首先，确认文件扩展名为 `.md` 而不是 `.markdown`，Jekyll 只处理 `.md` 文件。

其次，检查 Front Matter 是否完整且语法正确。YAML 对缩进和空格敏感，错误的语法会导致 Jekyll 无法正确解析。

第三，确认文件存放在正确的目录中。文档应放在 `docs` 目录，独立页面应放在根目录。

第四，可能是缓存问题。尝试清除浏览器缓存，或等待 GitHub Pages 重新构建（通常需要几分钟）。

第五，检查 Jekyll 构建日志，确认没有错误信息。

### 8.2 如何修改文章发布日期

编辑文章 Front Matter 中的 `date` 字段即可修改发布日期。日期格式为 `YYYY-MM-DD HH:MM:SS +0800`。修改后提交更改，GitHub Pages 会自动重新构建网站。

### 8.3 如何为文章添加分类或标签

虽然本项目主要使用 `docs` 目录，但您仍然可以在 Front Matter 中添加 `categories` 和 `tags` 字段来组织内容：

```markdown
---
title: Python 教程
date: 2024-03-25 10:30:00 +0800
description: Python 入门教程
categories:
  - 编程语言
  - 教程
tags:
  - Python
  - 入门
---
```

这些字段虽然不会自动生成分类页面，但可以用于自定义布局中的内容筛选或展示。

### 8.4 文章中的代码块不显示行号怎么办

本项目的代码渲染使用 Rouge 语法高亮，默认不显示行号以获得更简洁的视觉效果。如果需要显示行号，可以在 Front Matter 中设置：

````markdown
---
title: 代码示例
date: 2024-03-25 10:30:00 +0800
description: 代码示例展示
---

```python
# 这是一个代码示例
def hello():
    print("Hello!")
```
````

代码块会自动应用语法高亮样式，不需要额外配置。

### 8.5 如何禁用某篇文章的渲染样式

默认情况下，`docs` 目录下的所有文章都会应用 `doc` 布局和现代化渲染样式。如果您希望某篇文章使用默认布局，可以在 Front Matter 中指定：

```markdown
---
title: 自定义页面
date: 2024-03-25 10:30:00 +0800
description: 使用默认布局的页面
layout: default
---
```

### 8.6 图片路径不正确怎么办

图片路径错误是常见问题，请确保：

图片文件存放在 `images` 目录中，引用时使用绝对路径 `/images/文件名.扩展名`。

如果图片仍然无法显示，请检查：

- 图片文件名是否正确（区分大小写）
- 图片文件扩展名是否正确
- 路径中的斜杠方向是否正确（使用 `/`）

### 8.7 如何测试本地效果

在提交更改之前，建议在本地测试文章效果：

首先，确保已安装 Ruby 和 Jekyll。如果未安装，可以参考 Jekyll 官方文档进行安装。

其次，在项目根目录执行 `bundle install` 安装依赖。

然后，执行 `jekyll serve` 启动本地服务器。

最后，在浏览器中访问 `http://localhost:4000` 查看效果。

## 九、参考资源

如果您需要进一步了解 Jekyll 和 Markdown 的使用方法，以下资源可能会有帮助：

Jekyll 官方文档位于 https://jekyllrb.com/，提供了完整的安装配置和使用指南，包括配置选项、模板制作、插件使用等内容。

Markdown 中文说明位于 https://www.markdown.cn/，是学习 Markdown 语法的好帮手，提供了详细的语法说明和示例。

GitHub Pages 官方文档位于 https://docs.github.com/en/pages，介绍了如何利用 GitHub Pages 托管静态网站，包括自定义域名、HTTPS 配置、构建失败排查等内容。

Kramdown 语法说明位于 https://kramdown.gettalong.org/，Kramdown 是 Jekyll 默认使用的 Markdown 解释器，支持一些额外的语法扩展。

## 十、总结

本指南详细介绍了 XiaoqiangClub 项目的文章创建方法，包括目录结构说明、文章创建步骤、访问路径解析、Markdown 语法参考等内容。

核心要点总结：

文章主要存放在 `docs` 目录中，使用英文文件名。访问路径为 `/docs/文件名/`。使用 Front Matter 定义文章元数据。图片存放在 `images` 目录中。根目录可放置独立页面。

感谢您阅读本指南！如果您有任何问题或建议，欢迎通过网站上的联系方式与我们交流。祝您创作愉快！
