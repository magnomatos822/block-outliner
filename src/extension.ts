import * as vscode from 'vscode';

let blockHighlightDecorationTypeRound: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeSquare: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeCurly: vscode.TextEditorDecorationType;
let isActive = false;

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "block-outliner" is now active');

	blockHighlightDecorationTypeRound = vscode.window.createTextEditorDecorationType({
		border: '1px solid #ff7f7f',
		borderRadius: '2px',
		backgroundColor: 'rgba(255,127,127,0.1)',
		isWholeLine: false
	});

	blockHighlightDecorationTypeSquare = vscode.window.createTextEditorDecorationType({
		border: '1px solid #7f7fff',
		borderRadius: '2px',
		backgroundColor: 'rgba(127,127,255,0.1)',
		isWholeLine: false
	});

	blockHighlightDecorationTypeCurly = vscode.window.createTextEditorDecorationType({
		border: '1px solid #7fff7f',
		borderRadius: '2px',
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

	vscode.workspace.onDidChangeTextDocument(event => {
		if (isActive && event.document === vscode.window.activeTextEditor?.document) {
			updateDecorations();
		}
	}, null, context.subscriptions);
}

function clearDecorations() {
	if (vscode.window.activeTextEditor) {
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeRound, []);
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeSquare, []);
		vscode.window.activeTextEditor.setDecorations(blockHighlightDecorationTypeCurly, []);
	}
}

function updateDecorations() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}

	const text = activeEditor.document.getText();
	const cursorPosition = activeEditor.selection.active;
	const cursorOffset = activeEditor.document.offsetAt(cursorPosition);

	// Limpar decorações anteriores
	clearDecorations();

	// Encontrar todos os blocos
	const blocks = findBlocks(text);
	const decorations: { [key: string]: vscode.DecorationOptions[] } = {
		round: [],
		square: [],
		curly: []
	};

	// Filtrar e aplicar decorações para blocos aninhados
	const nestedBlocks = findNestedBlocks(blocks, cursorOffset);
	for (const block of nestedBlocks) {
		// Criar uma Range que abrange todo o bloco
		const startPos = activeEditor.document.positionAt(block.start);
		const endPos = activeEditor.document.positionAt(block.end);
		const decorationOptions: vscode.DecorationOptions = {
			range: new vscode.Range(startPos, endPos),
			hoverMessage: `Bloco ${block.type}`
		};

		// Aplicar a decoração apropriada com base no tipo de bloco
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

	// Aplicar todas as decorações
	activeEditor.setDecorations(blockHighlightDecorationTypeRound, decorations.round);
	activeEditor.setDecorations(blockHighlightDecorationTypeSquare, decorations.square);
	activeEditor.setDecorations(blockHighlightDecorationTypeCurly, decorations.curly);
}


interface Block {
	start: number;
	end: number;
	type: 'round' | 'square' | 'curly';
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
	let stringChar = '';

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		// Toggle string state
		if ((char === '"' || char === "'" || char === '`') && (i === 0 || text[i - 1] !== '\\')) {
			if (inString && stringChar === char) {
				inString = false;
			} else if (!inString) {
				inString = true;
				stringChar = char;
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

	return blocks;
}

function findNestedBlocks(blocks: Block[], cursorOffset: number): Block[] {
	const nestedBlocks: Block[] = [];

	for (const block of blocks) {
		if (cursorOffset >= block.start && cursorOffset <= block.end) {
			nestedBlocks.push(block);
		}
	}

	// Sort blocks by their size (smallest to largest) to highlight nested blocks first
	nestedBlocks.sort((a, b) => (a.end - a.start) - (b.end - b.start));

	return nestedBlocks;
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
