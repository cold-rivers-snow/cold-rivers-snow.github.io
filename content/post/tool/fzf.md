---
title: "🔍 fzf：终端模糊查找神器，效率提升利器！🚀"
date: 2025-11-19T20:04:14+08:00
author: ["寒江雪"]

categories:
- tool

description: ""
summary: "工具实战"
draft: true
math: true
comments: true
image: 
toc: true
showToc: true
TocOpen: true
readingTime: true
autonumbering: true
hidemeta: false
disableShare: true
searchHidden: false
showbreadcrumbs: true
mermaid: true
style:  
    background: "white"
    color: "black"
license: 
    enabled: false
    default: Licensed under CC BY-NC-SA 4.0
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
---

在日常开发和运维中，命令行工具就像程序员的“瑞士军刀”。今天要介绍的 **fzf（Fuzzy Finder）**，是一个能让你在终端中**快速筛选、查找、执行命令**的神器。无论你是 Linux、macOS 还是 Windows（通过 WSL）用户，fzf 都能让你的命令行效率翻倍！

---

## 🧰 什么是 fzf？

**fzf**（Fuzzy Finder）是一款命令行下的**模糊搜索工具**，能帮助你在终端中快速从一堆选项中找到你想要的内容。

### 🔑 核心功能

- 实时模糊搜索
- 支持命令行交互
- 可与 Git、Docker、Zsh、Tmux 等工具集成
- 跨平台支持（Linux、macOS、Windows）

🔗 GitHub 地址：https://github.com/junegunn/fzf

---

## 🚀 为什么你需要 fzf？

在没有 fzf 的时候，我们可能需要手动输入命令、翻查历史记录，效率低下，ctrl + r 记录的内容有限。而 fzf 能帮你：
✅ 快速打开最近修改的文件
✅ 搜索并执行命令历史
✅ 查找并进入某个目录
✅ 快速切换 Git 分支或提交记录
✅ 过滤并查看运行中的进程

**效率提升小计算**：每天节省 10 分钟命令行查找时间，一年就能节省 60 小时！

---

## 🛠️ 安装方式（以 Linux/macOS 为例）

### 方法 1：使用 Homebrew（macOS 推荐）

```bash
brew install fzf
```

安装 shell 插件（绑定快捷键）：

```bash
$(brew --prefix)/opt/fzf/install
```

### 方法 2：使用 Git 安装（Linux）

```bash
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

安装完成后，重启终端即可使用！

---

## 🧑‍💻 玩法：以centos7 bash 函数为例实现快速执行命令

### 步骤 1：安装 fzf

```bash
# 下载源码
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
# 安装
cd ~/.fzf
./install
```

### 步骤 2：配置片段文件

创建常用命令库：

```bash
cat > ~/.my_snippets.txt <<EOF
# 常用命令
ls -lh
ps aux | grep ceph
df -h
free -m
tail -f /var/log/messages
git log --oneline -10
docker ps
EOF
```

### 步骤 3：配置 bash 函数

将以下代码加入 `~/.bashrc`：

```bash
# 内部函数：选择命令
_snip_choose() {
    local file="$HOME/.my_snippets.txt"
    [[ -f "$file" ]] || return 1
    grep -v ^\s*# "$file" | grep -v ^\s*$ | fzf --height 40% --prompt="🔍 Snip> "
}

# 绑定快捷键 Ctrl+G
_snip_inject() {
    local cmd=$(_snip_choose)
    if [[ -n "$cmd" ]]; then
        READLINE_LINE="$cmd"
        READLINE_POINT=${#cmd}
    fi
}
bind -x "\C-g": _snip_inject
```

### 步骤 4：重载配置

```bash
source ~/.bashrc
```

### 使用方法 💡

1. 按下 `Ctrl + G` 唤出搜索框
2. 输入关键词（如 `git`）→ 选择命令 → 按 `Enter`
3. 命令自动出现在终端，直接执行！

---

## 🧬 高级功能：支持参数的命令

### 示例：带占位符的命令

在 `~/.my_snippets.txt` 中添加：

```bash
cat > ~/.my_snippets.txt <<EOF
# File transfer
scp <local_file> <user>@<remote_host>:<remote_path>
rsync -av <src_dir>/ <dest_dir>/

# Logs
tail -f /var/log/<service>.log
grep "<pattern>" /var/log/messages

# Docker
docker exec -it <container_name> /bin/bash
docker run -d --name <name> <image>

# Network
ping <host>
curl -X POST http://<api_host>:<port>/<endpoint>
EOF
```

### 修改函数支持占位符

可以使用修改参数的指令，自动在第一个参数位置修改指令

```bash
# ~/.bashrc

# 从片段文件选择命令（带 <...> 占位符）
_snip_choose() {
    local file="$HOME/.my_snippets.txt"
    [[ -f "$file" ]] || { echo "❌ $file not found" >&2; return 1; }
    grep -v '^\s*#' "$file" | grep -v '^\s*$' | fzf --height 40% --reverse --prompt="🔍 Snip> "
}

# 注入并清理占位符
_snip_inject() {
    local raw_cmd
    raw_cmd=$(_snip_choose) || return 1

    if [[ -n "$raw_cmd" ]]; then
        # Step 1: 移除所有 <...> 的尖括号，保留内容
        # 例如: "scp <file> user@<host>" → "scp file user@host"
        local clean_cmd=""
        local i=0
        local len=${#raw_cmd}
        local in_placeholder=false
        local first_placeholder_pos=-1

        while (( i < len )); do
            local char="${raw_cmd:i:1}"
            if [[ "$char" == "<" && "$in_placeholder" == false ]]; then
                in_placeholder=true
                # 记录第一个占位符内容的起始位置（在 clean_cmd 中的位置）
                if (( first_placeholder_pos == -1 )); then
                    first_placeholder_pos=${#clean_cmd}
                fi
            elif [[ "$char" == ">" && "$in_placeholder" == true ]]; then
                in_placeholder=false
            elif [[ "$in_placeholder" == false ]]; then
                clean_cmd+="$char"
            else
                # 在 <...> 内部，只保留内容（去掉 '<' 和 '>'）
                clean_cmd+="$char"
            fi
            ((i++))
        done

        # Step 2: 设置命令行内容
        READLINE_LINE="$clean_cmd"

        # Step 3: 定位光标
        if (( first_placeholder_pos >= 0 )); then
            READLINE_POINT=$first_placeholder_pos
        else
            READLINE_POINT=${#clean_cmd}  # 无占位符，光标放末尾
        fi
    fi
}

# 绑定快捷键 Ctrl+G
bind -x '"\C-g": _snip_inject'
```

### 重新加载配置即可

```bash
source ~/.bashrc
```

**使用效果**：

- 输入 `ping <host>`，光标自动跳到 `host` 位置，方便快速修改。
- 在使用快捷键删除按 Ctrl+K（删除从光标到行尾）或按 Alt+D（删除下一个词）

---

## 📈 小结：fzf 是你的效率工具吗？


| 优点                  | 劣势                    |
| --------------------- | ----------------------- |
| ✅ 开源免费，跨平台   | ❗ 需熟悉命令行基础     |
| ✅ 与主流工具深度集成 | ❗ 初学者需适应交互界面 |
| ✅ 极大提升查找效率   |                         |

**适合人群**：每天敲命令、查文件、翻历史的开发者、运维、DevOps 工程师。