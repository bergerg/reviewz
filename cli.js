#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { parseHotelReview } from './src/index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
const program = new Command();
program
    .name('reviewz')
    .description('Parse hotel reviews using LangChain and Gemini')
    .version('1.0.0');
program
    .command('parse')
    .description('Parse a hotel review')
    .option('-t, --text <review>', 'Review text to parse')
    .option('-e, --example <name>', 'Use an example review')
    .option('-i, --interactive', 'Enter review interactively')
    .action(async (options) => {
    try {
        let reviewText;
        if (options.text) {
            reviewText = options.text;
        }
        else if (options.example) {
            const examplePath = join(process.cwd(), 'examples', `${options.example}.txt`);
            reviewText = readFileSync(examplePath, 'utf-8');
        }
        else if (options.interactive) {
            reviewText = await getInteractiveInput();
        }
        else {
            console.log('\nAvailable examples:');
            listExamples();
            console.log('\nUse one of:');
            console.log('  reviewz parse -e <example-name>');
            console.log('  reviewz parse -t "your review text"');
            console.log('  reviewz parse -i');
            return;
        }
        console.log('\nParsing hotel review...\n');
        const structured = await parseHotelReview(reviewText);
        console.log('Structured Review:');
        console.log(JSON.stringify(structured, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
program
    .command('list')
    .description('List available example reviews')
    .action(() => {
    listExamples();
});
function listExamples() {
    const examplesDir = join(process.cwd(), 'examples');
    const files = readdirSync(examplesDir).filter(f => f.endsWith('.txt'));
    files.forEach(file => {
        const name = file.replace('.txt', '');
        console.log(`  - ${name}`);
    });
}
function getInteractiveInput() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log('Enter your hotel review (press Ctrl+D or Ctrl+Z when done):\n');
        let input = '';
        rl.on('line', (line) => {
            input += line + '\n';
        });
        rl.on('close', () => {
            resolve(input.trim());
        });
    });
}
async function startRepl() {
    console.log('\n🏨 Reviewz REPL Mode');
    console.log('Commands: list | parse <example-name> | quit');
    console.log('Or type your review text directly\n');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'reviewz> '
    });
    rl.prompt();
    rl.on('line', async (line) => {
        const input = line.trim();
        if (!input) {
            rl.prompt();
            return;
        }
        if (input === 'quit' || input === 'exit') {
            console.log('Goodbye!');
            rl.close();
            process.exit(0);
        }
        if (input === 'list') {
            console.log('\nAvailable examples:');
            listExamples();
            console.log();
            rl.prompt();
            return;
        }
        if (input.startsWith('parse ')) {
            const exampleName = input.substring(6).trim();
            try {
                const examplePath = join(process.cwd(), 'examples', `${exampleName}.txt`);
                const reviewText = readFileSync(examplePath, 'utf-8');
                console.log('\nParsing...\n');
                const structured = await parseHotelReview(reviewText);
                console.log(JSON.stringify(structured, null, 2));
                console.log();
            }
            catch (error) {
                console.error(`Error: Could not find example "${exampleName}"`);
            }
            rl.prompt();
            return;
        }
        // Treat input as review text
        try {
            console.log('\nParsing...\n');
            const structured = await parseHotelReview(input);
            console.log(JSON.stringify(structured, null, 2));
            console.log();
        }
        catch (error) {
            console.error('Error parsing review:', error);
        }
        rl.prompt();
    });
    rl.on('close', () => {
        console.log('\nGoodbye!');
        process.exit(0);
    });
}
// Start REPL if no arguments provided
if (process.argv.length === 2) {
    startRepl();
}
else {
    program.parse();
}
