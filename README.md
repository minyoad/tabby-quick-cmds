# tabby-quick-cmds

A plugin that provides quick command functionality for Tabby terminal.

## Features

- Quick Command Menu: Quickly open command list through hotkeys
- Command Group Management: Support organizing commands by groups
- Multi-line Command Support: Execute complex commands containing multiple lines
- Hotkey Combination Support: Send special combination key commands (like Ctrl+C, Ctrl+I, etc.)
- Delayed Execution: Support adding delays between commands
- Enter Control: Option to automatically add carriage return at the end of commands
- Parameterized Commands: Support for defining and using parameters within commands
- SSH Profile Scoping: Limit commands or command groups to specific saved SSH profiles

## Hotkeys

- Windows: `Alt+Q`
- macOS: `Alt+Q`
- Linux: `Alt+Q`

## Installation

### Install from ZIP Package

1. Download the latest release ZIP package from [GitHub Releases](https://github.com/minyoad/terminus-quick-cmds/releases)
2. Extract the ZIP package
3. Copy the extracted folder to Tabby's plugins directory:
   - Windows: `%APPDATA%\tabby\plugins\node_modules`
   - macOS: `~/Library/Application Support/tabby/plugins`
   - Linux: `~/.config/tabby/plugins`
4. Restart Tabby
5. Verify the installation by checking if the Quick Commands menu appears in Tabby's settings

## Configuration

### Command Configuration

Each command contains the following properties:
- name: Command name
- text: Command content
- appendCR: Whether to automatically add carriage return (true/false)
- group: Command group (optional)
- SSH profiles: Optional list of saved SSH profiles where the command is available

### SSH Profile Scoping

Commands and groups can be bound to one or more saved SSH profiles from Tabby's
Profiles & connections settings.

- If no SSH profile is selected, the command or group is available in every terminal tab.
- If one or more SSH profiles are selected, the command or group is shown only when the active tab uses one of those profiles.
- If both a command and its group have SSH profile limits, both limits must match.
- Non-matching commands are hidden from the quick command menu and ignored by command shortcuts.

### Special Syntax

1. Multi-line Commands: Use line breaks directly in command content
```
cd /path/to/project
npm install
npm start
```

2. Combination Keys: Use ASCII control characters
- Ctrl+C: \x03
- Ctrl+I: \x09

3. Delayed Execution: Use \sxxx to add delay
- \s1000: Delay 1000 milliseconds

4. Parameterized Commands: Use `${parameter_name}` to define a parameter. When executing the command, a dialog will pop up asking for the value of each parameter.

## Usage Examples

1. Basic Command
```
name: "List Files"
text: "ls -la"
appendCR: true
```

2. Multi-line Command Example
```
name: "Start Project"
text: "cd ~/project\nnpm install\nnpm start"
appendCR: true
```

3. Command with Delay
```
name: "Step Execution"
text: "echo Step 1\s1000\necho Step 2\s1000\necho Step 3"
appendCR: true
```

4. Combination Key Command
```
name: "Interrupt Process"
text: "\x03"
appendCR: false
```

5. Parameterized Command
```
name: "Git Commit"
text: "git commit -m \"${message}\""
appendCR: true
```


Disable **Parse quick command parameters** in the command editor to send Bash expansions such as `${arr[@]}` and `${name}` unchanged. The stored property is `parseParameters: false`; omitted or `true` preserves parameter prompts. Menu execution and command shortcuts both use this setting, which is enabled by default. A command that mixes shell expansions and quick-command parameters still needs a distinct parameter syntax or explicit declarations in a future change.

Each command and group has a **Hidden** toggle, disabled by default (`hidden` omitted or `false`). Hidden groups and commands are excluded from the quick selection menu, including search results. To show a command, turn Hidden off for both the command and its group (including Ungrouped). Existing entries without the field remain visible and usable. All entries remain editable in Settings, with direct Hidden toggles; hiding does not disable saved command shortcuts.

The group editor also provides **Limit to SSH profiles**. It is enabled automatically for groups with existing profile bindings. Disabling it clears the group bindings when saved; individual command profile limits still apply.
