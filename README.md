# Block Outliner

**Block Outliner** is a Visual Studio Code extension that visually highlights code blocks enclosed by parentheses, brackets, and braces, making it easier to read and navigate through nested structures.

## Features

- **Highlights code blocks**: Visually outlines code blocks with colored borders for each type of delimiter:
  - Parentheses `()` - Red
  - Brackets `[]` - Blue
  - Braces `{}` - Green
- **Nested block highlighting**: Highlights nested code blocks, helping to identify the code structure.
- **Toggle On/Off**: Enable or disable the extension with a simple command or keyboard shortcut.

## How to Use

### Activating the Extension

You can activate the extension in two ways:

1. **Command Palette**:
   - Open the command palette with `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
   - Type `Block Outliner: Toggle Block Outliner` and press `Enter`.

2. **Keyboard Shortcut**:
   - Use the shortcut `Ctrl+Alt+B` (or `Cmd+Alt+B` on macOS) to toggle Block Outliner on and off.

### Configuration

By default, the extension is enabled. You can change this setting in the VSCode settings:

1. Open VSCode settings (`Ctrl+,` or `Cmd+,` on macOS).
2. Search for "Block Outliner".
3. Enable or disable the extension as needed.

### Customizing Colors and Borders

Currently, the colors and borders of the blocks are fixed:
- Parentheses `()` are highlighted in **red**.
- Brackets `[]` are highlighted in **blue**.
- Braces `{}` are highlighted in **green**.

In future versions, customization of these colors might be considered directly in the extension settings.

### Usage Examples

- **Parentheses Blocks**:
  ```javascript
  function calculate(a, b) {
    return (a + b) * (a - b);
  }

This code will highlight the parentheses block (a + b) in red.

- **Brackets Blocks:**

```javascript
const arr = [1, 2, [3, 4], 5];
The block [3, 4] will be highlighted in blue.
```

- **Braces Blocks:**

```javascript
if (condition) {
  const obj = {
    key: "value"
  };
}
```

The block { key: "value" } will be highlighted in green.

Contributions
Contributions are welcome! Feel free to open issues and pull requests on the GitHub repository.

License
This extension is licensed under the MIT License. See the [LICENSE](LICENSE.txt) for more details.

Author
Developed by Magno Matos. If you have any questions or suggestions, feel free to reach out.

Thank you for using Block Outliner! I hope this extension makes it easier to read and understand your code.