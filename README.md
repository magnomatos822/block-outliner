# Block Outliner

**Block Outliner** is a Visual Studio Code extension that highlights code blocks enclosed in parentheses `()`, square brackets `[]`, and curly braces `{}` with colored outlines, making it easier to visualize and understand the code structure.

## Features

- **Highlights Code Blocks**: Identifies and highlights blocks of code enclosed in parentheses, square brackets, and curly braces with different colors.
- **Block Outlining**: Applies a border around entire blocks of code instead of applying decorations line by line.
- **Toggle Activation**: Enable or disable the functionality with a command.

## Installation

1.**Clone the repository:**

```bash
   git clone https://github.com/your-username/block-outliner.git
```

2.**Navigate to the project directory:**

```bash
Copiar código
cd block-outliner
```

3.**Install dependencies:**

```bash
npm install
```

1.**Compile the project:**

```bash
npm run compile
```

1. **Load the extension in VSCode:**

- Open VSCode.
- Go to the Extensions panel (Ctrl+Shift+X).
- Click "Install from VSIX" and select the generated .vsix file.

## Usage

1. **Activate the Extension:**

- Run the command Block Outliner: Block Outliner from the command palette (Ctrl+Shift+P).
- The extension will be activated and will apply the outline around the code blocks.

2. **Deactivate the Extension:**

- Run the command Block Outliner: Block Outliner again to deactivate the extension and remove decorations.

## Behavior

The extension applies decorations based on the type of code block:

- **Parentheses ():** Highlighted with a red border.
- **Square Brackets** []: Highlighted with a blue border.
- **Curly Braces {}:** Highlighted with a green border.

Decorations are applied as a single block, covering the entire code between the delimiters.

## Development

To contribute to the project:

1. **Fork the repository.**

2. **Create a branch for your feature:**

```bash
git checkout -b my-feature
```

3. **Make your changes and commit:**

```bash
git commit -am 'Add new feature'
```

4. **Push to the remote repository:**

```bash
git push origin my-feature
```

5. **Open a Pull Request.**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact <magnomatos822@gmail.com>.

Thank you for using Block Outliner and for any contributions to the project!
