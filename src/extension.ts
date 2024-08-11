import * as vscode from 'vscode';

let blockHighlightDecorationTypeRound: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeSquare: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeCurly: vscode.TextEditorDecorationType;
let isActive = false;

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "block-outliner" is now active');

	blockHighlightDecorationTypeRound = vscode.window.createTextEditorDecorationType({
		border: '1px solid #ff7f7f',
		borderRadius: '3px',
		backgroundColor: 'rgba(255,127,127,0.1)',
		isWholeLine: false
	});

	blockHighlightDecorationTypeSquare = vscode.window.createTextEditorDecorationType({
		border: '1px solid #7f7fff',
		borderRadius: '3px',
		backgroundColor: 'rgba(127,127,255,0.1)',
		isWholeLine: false
	});

	blockHighlightDecorationTypeCurly = vscode.window.createTextEditorDecorationType({
		border: '1px solid #7fff7f',
		borderRadius: '3px',
		backgroundColor: 'rgba(127,255,127,0.1)',
		isWholeLine: false
	});

	let disposable = vscode.commands.registerCommand('block-outliner.blockOutliner', () => {
		isActive = !isActive;
		if (isActive) {
			vscode.window.showInformationMessage('Block Outliner activated');
			updateDecorations();
		} else {
			vscode.window.showInformationMessage('Block Outliner deactivated');
			clearDecorations();
		}
	});

	context.subscriptions.push(disposable);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (isActive && editor) {
			updateDecorations();
		}
	}, null, context.subscriptions);

	vscode.window.onDidChangeTextEditorSelection(event => {
		if (isActive && event.textEditor) {
			updateDecorations();
		}
	}, null, context.subscriptions);
}

function updateDecorations() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    const text = activeEditor.document.getText();
    const cursorPosition = activeEditor.selection.active;
    const cursorOffset = activeEditor.document.offsetAt(cursorPosition);

    // Clear previous decorations
    clearDecorations();

    // Find the blocks around the cursor
    const blocks = findBlocks(text);
    const decorations: { [key: string]: vscode.DecorationOptions[] } = {
        round: [],
        square: [],
        curly: []
    };

    // Iterate over each block and create a continuous decoration
    for (const block of blocks) {
        if (cursorOffset >= block.start && cursorOffset <= block.end) {
            const startPos = activeEditor.document.positionAt(block.start);
            const endPos = activeEditor.document.positionAt(block.end);

            // Create a range that spans the entire block across multiple lines
            const decorationOptions: vscode.DecorationOptions = {
                range: new vscode.Range(
                    startPos.line, startPos.character,
                    endPos.line, endPos.character
                )
            };

            // Apply the appropriate decoration based on the block type
            switch (block.type) {
                case 'round':
                    decorations.round.push(decorationOptions);
                    break;
                case 'square':
                    decorations.square.push(decorationOptions);
                    break;
                case 'curly':
                    decorations.curly.push(decorationOptions);
                    break;
            }
        }
    }

    // Apply all decorations
    activeEditor.setDecorations(blockHighlightDecorationTypeRound, decorations.round);
    activeEditor.setDecorations(blockHighlightDecorationTypeSquare, decorations.square);
    activeEditor.setDecorations(blockHighlightDecorationTypeCurly, decorations.curly);
}


function clearDecorations() {
	if (vscode.window.activeTextEditor) {
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeRound, []);
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeSquare, []);
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeCurly, []);
	}
}

interface Block {
	start: number;
	end: number;
	type: 'round' | 'square' | 'curly';
}

function findContainingBlock(text: string, cursorOffset: number): Block | null {
	const blocks = findBlocks(text);

	for (const block of blocks) {
		if (cursorOffset >= block.start && cursorOffset <= block.end) {
			return block;
		}
	}

	return null;
}

function findBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	const stack: { index: number, type: 'round' | 'square' | 'curly' }[] = [];
	const openSymbols = '({[';
	const closeSymbols = ')}]';

	const typeMapping: { [key: string]: 'round' | 'square' | 'curly' } = {
		'(': 'round',
		'[': 'square',
		'{': 'curly'
	};

	let inString = false;
	let stringStart = -1;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
			if (inString) {
				inString = false;
				blocks.push({ start: stringStart, end: i + 1, type: 'round' }); // Temporary block type
			} else {
				inString = true;
				stringStart = i;
			}
			continue;
		}

		if (inString) {
			continue;
		}

		if (openSymbols.includes(char)) {
			stack.push({ index: i, type: typeMapping[char] });
		} else if (closeSymbols.includes(char)) {
			if (stack.length > 0 && openSymbols.indexOf(text[stack[stack.length - 1].index]) === closeSymbols.indexOf(char)) {
				const { index, type } = stack.pop()!;
				blocks.push({ start: index, end: i + 1, type });
			}
		}
	}

	return mergeBlocks(blocks);
}

function mergeBlocks(blocks: Block[]): Block[] {
	if (blocks.length === 0) return [];

	blocks.sort((a, b) => a.start - b.start);

	const mergedBlocks: Block[] = [];
	let currentBlock = blocks[0];

	for (let i = 1; i < blocks.length; i++) {
		if (blocks[i].start <= currentBlock.end) {
			currentBlock.end = Math.max(currentBlock.end, blocks[i].end);
		} else {
			mergedBlocks.push(currentBlock);
			currentBlock = blocks[i];
		}
	}

	mergedBlocks.push(currentBlock);
	return mergedBlocks;
}

export function deactivate() {
	if (blockHighlightDecorationTypeRound) {
		blockHighlightDecorationTypeRound.dispose();
	}
	if (blockHighlightDecorationTypeSquare) {
		blockHighlightDecorationTypeSquare.dispose();
	}
	if (blockHighlightDecorationTypeCurly) {
		blockHighlightDecorationTypeCurly.dispose();
	}
}
