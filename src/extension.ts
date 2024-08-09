import * as vscode from 'vscode';

let blockHighlightDecorationType: vscode.TextEditorDecorationType;
let isActive = false;

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "block-outliner" is now active');

	blockHighlightDecorationType = vscode.window.createTextEditorDecorationType({
		border: '1px solid #888',
		borderRadius: '3px',
		backgroundColor: 'rgba(100,100,100,0.1)'
	});

	let disposable = vscode.commands.registerCommand('block-outliner.blockOutliner', () => {
		isActive = !isActive;
		if (isActive) {
			vscode.window.showInformationMessage('Block Outliner ativado');
			updateDecorations();
		} else {
			vscode.window.showInformationMessage('Block Outliner desativado');
			clearDecorations();
		}
	});

	context.subscriptions.push(disposable);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (isActive && editor) {
			updateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (isActive && vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
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
	const blocks = findBlocks(text);
	const decorations = blocks.map(block => {
		const startPos = activeEditor.document.positionAt(block.start);
		const endPos = activeEditor.document.positionAt(block.end);
		return {
			range: new vscode.Range(startPos.line, startPos.character, endPos.line, endPos.character)
		};
	});

	activeEditor.setDecorations(blockHighlightDecorationType, decorations);
}

function clearDecorations() {
	if (vscode.window.activeTextEditor) {
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationType, []);
	}
}

interface Block {
	start: number;
	end: number;
}

function findBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	const stack: number[] = [];
	const openSymbols = '({[';
	const closeSymbols = ')}]';

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (openSymbols.includes(char)) {
			stack.push(i);
		} else if (closeSymbols.includes(char)) {
			if (stack.length > 0 && openSymbols.indexOf(text[stack[stack.length - 1]]) === closeSymbols.indexOf(char)) {
				const start = stack.pop()!;
				blocks.push({ start, end: i + 1 });
			}
		}
	}

	// Merging contiguous and multi-line blocks
	const mergedBlocks: Block[] = [];
	let lastBlock: Block | null = null;

	for (const block of blocks) {
		if (lastBlock && block.start <= lastBlock.end) {
			lastBlock.end = Math.max(lastBlock.end, block.end);
		} else {
			if (lastBlock) mergedBlocks.push(lastBlock);
			lastBlock = { ...block };
		}
	}

	if (lastBlock) mergedBlocks.push(lastBlock);

	return mergedBlocks;
}

export function deactivate() {
	if (blockHighlightDecorationType) {
		blockHighlightDecorationType.dispose();
	}
}