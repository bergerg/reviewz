# Reviewz

Hotel review parsing workflow using LangChain.js

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Google API key to `.env`

## Usage

```javascript
import { parseHotelReview } from './src/index.js';

const review = "Great hotel, loved the location and service...";
const structured = await parseHotelReview(review);
console.log(structured);
```

## Usage

### REPL Mode (default)
```bash
npm run cli
```
Interactive mode with commands:
- `list` - show available examples
- `parse <example-name>` - parse an example
- Type review text directly to parse it
- `quit` or `exit` to exit

### List available examples
```bash
npm run cli list
```

### Parse an example review
```bash
npm run cli parse -e grand-plaza-chicago
npm run cli parse -e beach-resort-miami
```

### Parse custom review text
```bash
npm run cli parse -t "Great hotel, amazing service!"
```

### Interactive mode
```bash
npm run cli parse -i
```

### Quick test
```bash
npm run dev
```

## Schema

The parser extracts:
- Hotel name and location
- Overall rating (1-5)
- Sentiment analysis
- Aspect ratings (cleanliness, service, location, value, amenities)
- Highlights and issues
- Reviewer type
- Summary
