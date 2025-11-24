#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { processReview } from './src/index';
import type { Review } from './src/types';
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
      let input: Review;

      if (options.text) {
        input = {
          hotelName: 'Unknown Hotel',
          location: 'Unknown',
          review: options.text,
          score: 0
        };
      } else if (options.example) {
        const examplePath = join(process.cwd(), 'examples', `${options.example}.json`);
        input = JSON.parse(readFileSync(examplePath, 'utf-8'));
      } else if (options.interactive) {
        const reviewText = await getInteractiveInput();
        input = {
          hotelName: 'Unknown Hotel',
          location: 'Unknown',
          review: reviewText,
          score: 0
        };
      } else {
        console.log('\nAvailable examples:');
        listExamples();
        console.log('\nUse one of:');
        console.log('  reviewz parse -e <example-name>');
        console.log('  reviewz parse -t "your review text"');
        console.log('  reviewz parse -i');
        return;
      }

      console.log('\nProcessing hotel review...\n');
      const result = await processReview(input);
      
      console.log('Structured Review:');
      console.log(JSON.stringify(result.review, null, 2));
      
      if (result.validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.validation.warnings.forEach(w => console.log(`  - [${w.type}] ${w.message}`));
      }
    } catch (error) {
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
  const files = readdirSync(examplesDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const name = file.replace('.json', '');
    console.log(`  - ${name}`);
  });
}

function getInteractiveInput(): Promise<string> {
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
        const examplePath = join(process.cwd(), 'examples', `${exampleName}.json`);
        const exampleData: Review = JSON.parse(readFileSync(examplePath, 'utf-8'));
        console.log('\nProcessing...\n');
        const result = await processReview(exampleData);
        console.log(JSON.stringify(result.review, null, 2));
        if (result.validation.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.validation.warnings.forEach(w => console.log(`  - [${w.type}] ${w.message}`));
        }
        console.log();
      } catch (error) {
        console.error(`Error: Could not find example "${exampleName}"`);
      }
      rl.prompt();
      return;
    }

    // Treat input as review text
    try {
      console.log('\nProcessing...\n');
      const reviewInput: Review = {
        hotelName: 'Unknown Hotel',
        location: 'Unknown',
        review: input,
        score: 0
      };
      const result = await processReview(reviewInput);
      console.log(JSON.stringify(result.review, null, 2));
      if (result.validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.validation.warnings.forEach(w => console.log(`  - [${w.type}] ${w.message}`));
      }
      console.log();
    } catch (error) {
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
} else {
  program.parse();
}
