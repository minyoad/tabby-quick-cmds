# tabby-quick-cmds

一个为Tabby终端提供快速命令功能的插件。

## 功能特性

- 快速命令菜单：通过快捷键快速打开命令列表
- 命令分组管理：支持将命令按组进行分类管理
- 多行命令支持：可以执行包含多行的复杂命令
- 组合键支持：支持发送特殊的组合键命令（如Ctrl+C、Ctrl+I等）
- 延迟执行：支持在命令之间添加延时
- 回车控制：可以选择是否在命令末尾自动添加回车
- 参数化命令：支持在命令中定义和使用参数

## 快捷键

- Windows: `Alt+Q`
- macOS: `Alt+Q`
- Linux: `Alt+Q`

## 安装说明

### 使用压缩包安装

1. 从 [GitHub Releases](https://github.com/minyoad/terminus-quick-cmds/releases) 下载最新版本的ZIP压缩包
2. 解压下载的ZIP压缩包
3. 将解压后的文件夹复制到Tabby的插件目录：
   - Windows: `%APPDATA%\tabby\plugins\node_modules`
   - macOS: `~/Library/Application Support/tabby/plugins`
   - Linux: `~/.config/tabby/plugins`
4. 重启Tabby
5. 在Tabby的设置中查看是否出现Quick Commands菜单，以验证安装是否成功

## 配置说明

### 命令配置

每个命令包含以下属性：
- name: 命令名称
- text: 命令内容
- appendCR: 是否自动添加回车（true/false）
- group: 所属分组（可选）

### 特殊语法

1. 多行命令：直接在命令内容中使用换行符
```
cd /path/to/project
npm install
npm start
```

2. 组合键：使用ASCII控制字符
- Ctrl+C: \x03
- Ctrl+I: \x09

3. 延迟执行：使用\sxxx添加延时
- \s1000：延迟1000毫秒

4. 参数化命令：使用`${参数名}`来定义一个参数。在执行命令时，会弹出一个对话框来让你输入每个参数的值。

## 使用示例

1. 基本命令
```
name: "列出文件"
text: "ls -la"
appendCR: true
```

2. 多行命令示例
```
name: "启动项目"
text: "cd ~/project\nnpm install\nnpm start"
appendCR: true
```

3. 带延迟的命令
```
name: "分步执行"
text: "echo Step 1\s1000\necho Step 2\s1000\necho Step 3"
appendCR: true
```

4. 组合键命令
```
name: "中断进程"
text: "\x03"
appendCR: false
```

5. 参数化命令
```
name: "Git提交"
text: "git commit -m \"${message}\""
appendCR: true
```

在命令编辑器中关闭 **Parse quick command parameters**，可原样发送 `${arr[@]}`、`${name}` 等 Bash 展开。配置字段为 `parseParameters: false`；省略或设置为 `true` 时保留原有参数提示行为。菜单执行和快捷键执行共用此开关，默认开启。同一命令混用 Shell 展开和插件参数时，仍需要后续引入独立语法或显式参数声明。

每个分组和命令均有 **Hidden（隐藏）** 开关，默认关闭（`hidden` 省略或为 `false`）。隐藏的分组及命令不会出现在快捷选择框或搜索结果中。要显示某条命令，需要同时关闭该命令及所属分组（包括未分组）的隐藏开关。已有条目未配置此字段时保持可见、可用。设置页仍显示全部条目，可直接切换隐藏状态；隐藏不影响已有快捷键执行。
