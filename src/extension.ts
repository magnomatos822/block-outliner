import * as vscode from 'vscode';

let blockHighlightDecorationTypeRound: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeSquare: vscode.TextEditorDecorationType;
let blockHighlightDecorationTypeCurly: vscode.TextEditorDecorationType;
let isActive = false;

// Chave para salvar o estado de ativação
const ACTIVATION_STATE_KEY = 'blockOutliner.isActive';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "block-outliner" is now active');

	blockHighlightDecorationTypeRound = createDecorationType('#ff7f7f');
	blockHighlightDecorationTypeSquare = createDecorationType('#7f7fff');
	blockHighlightDecorationTypeCurly = createDecorationType('#7fff7f');

	// Recupera o estado salvo e ativa/desativa conforme necessário
	isActive = context.globalState.get(ACTIVATION_STATE_KEY, false);
	if (isActive) {
		updateDecorations();
	}

	let disposable = vscode.commands.registerCommand('block-outliner.blockOutliner', () => {
		isActive = !isActive;

		// Salva o estado de ativação
		context.globalState.update(ACTIVATION_STATE_KEY, isActive);

		vscode.window.showInformationMessage(`Block Outliner ${isActive ? 'activated' : 'deactivated'}`);
		if (isActive) {
			updateDecorations();
		} else {
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

function createDecorationType(color: string): vscode.TextEditorDecorationType {
	return vscode.window.createTextEditorDecorationType({
		border: `1px solid ${color}`,
		borderRadius: '2px',
		isWholeLine: false
	});
}

function clearDecorations() {
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		activeEditor.setDecorations(blockHighlightDecorationTypeRound, []);
		activeEditor.setDecorations(blockHighlightDecorationTypeSquare, []);
		activeEditor.setDecorations(blockHighlightDecorationTypeCurly, []);
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

	clearDecorations();

	const blocks = findBlocks(text);
	const nestedBlocks = findNestedBlocks(blocks, cursorOffset);
	const decorations = getDecorationsForBlocks(nestedBlocks, activeEditor);

	activeEditor.setDecorations(blockHighlightDecorationTypeRound, decorations.round);
	activeEditor.setDecorations(blockHighlightDecorationTypeSquare, decorations.square);
	activeEditor.setDecorations(blockHighlightDecorationTypeCurly, decorations.curly);
}

function getDecorationsForBlocks(blocks: Block[], editor: vscode.TextEditor): { [key: string]: vscode.DecorationOptions[] } {
	const decorations: { [key: string]: vscode.DecorationOptions[] } = {
		round: [],
		square: [],
		curly: []
	};

	blocks.forEach(block => {
		const startPos = editor.document.positionAt(block.start);
		const endPos = editor.document.positionAt(block.end);
		const decorationOptions: vscode.DecorationOptions = {
			range: new vscode.Range(startPos, endPos),
			hoverMessage: `Block ${block.type}`
		};

		decorations[block.type].push(decorationOptions);
	});

	return decorations;
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

		if ((char === '"' || char === "'" || char === '`') && (i === 0 || text[i - 1] !== '\\')) {
			if (inString && stringChar === char) {
				inString = false;
			} else if (!inString) {
				inString = true;
				stringChar = char;
			}
			continue;
		}

		if (inString) continue;

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

// function findNestedBlocks(blocks: Block[], cursorOffset: number): Block[] {
// 	return blocks.filter(block => cursorOffset >= block.start && cursorOffset <= block.end)
// 		.sort((a, b) => (a.end - a.start) - (b.end - b.start));
// }
function findNestedBlocks(blocks: Block[], cursorOffset: number): Block[] {
    // Filtra os blocos que contêm o cursor
    let nestedBlocks = blocks.filter(block => cursorOffset > block.start && cursorOffset < block.end);

    // Seleciona o menor bloco que contém o cursor, mas não está contido em outro bloco
    if (nestedBlocks.length > 0) {
        let smallestBlock = nestedBlocks[0];
        for (let i = 1; i < nestedBlocks.length; i++) {
            if (nestedBlocks[i].start >= smallestBlock.start && nestedBlocks[i].end <= smallestBlock.end) {
                smallestBlock = nestedBlocks[i];
            }
        }
        return [smallestBlock];
    }

    return [];
}



export function deactivate() {
	blockHighlightDecorationTypeRound?.dispose();
	blockHighlightDecorationTypeSquare?.dispose();
	blockHighlightDecorationTypeCurly?.dispose();
}
