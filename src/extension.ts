import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Расширение активировано!');
    vscode.window.showInformationMessage('Расширение активировано!');

    const disposable = vscode.commands.registerCommand('extension.countLines', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Откройте папку проекта.');
            return;
        }

        let totalLines = 0;
        let processedFiles = 0;

        // Функция для подсчета строк в файле
        const countLinesInFile = (filePath: string): number => {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                let validLines = 0;

                // Подсчитываем только строки с кодом, игнорируем пустые и комментарии
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine !== '' && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*')) {
                        validLines++;
                    }
                });

                console.log(`Файл ${filePath} содержит ${validLines} строк кода.`);
                return validLines;
            } catch (error) {
                console.error(`Ошибка при чтении файла: ${filePath}`);
                vscode.window.showErrorMessage(`Ошибка при чтении файла: ${filePath}`);
                return 0;
            }
        };

        // Рекурсивная обработка директорий
        const processFolder = (folderPath: string) => {
            // Пропускаем папки build и tests
            const folderName = path.basename(folderPath).toLowerCase();
            if (folderName === 'build' || folderName === 'tests') {
                console.log(`Пропускаем папку: ${folderPath}`);
                return;
            }

            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const fullPath = path.join(folderPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    processFolder(fullPath); // Рекурсивный обход директорий
                } else {
                    console.log(`Анализируем файл: ${fullPath}`);
                    // Проверяем, если файл имеет расширение .h или .cpp
                    if (fullPath.endsWith('.h') || fullPath.endsWith('.cpp')) {
                        const linesInFile = countLinesInFile(fullPath);
                        totalLines += linesInFile;
                        processedFiles++;
                    }
                }
            }
        };

        const rootPath = workspaceFolders[0].uri.fsPath;
        processFolder(rootPath);

        // Показываем итоговый результат
        vscode.window.showInformationMessage(`Всего строк в .h и .cpp файлах (без пустых и комментариев): ${totalLines}`);
        console.log(`Всего строк в .h и .cpp файлах (без пустых и комментариев): ${totalLines}`);
        console.log(`Обработано файлов: ${processedFiles}`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
