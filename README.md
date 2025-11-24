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

## Run Example

```bash
npm run dev
```

Or build and run:
```bash
npm run build
node dist/example.js
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
