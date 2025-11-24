import 'dotenv/config';
import { parseHotelReview } from './src/index.js';

const exampleReview = `
I stayed at the Grand Plaza Hotel in downtown Chicago for 3 nights. 
The location was perfect - right next to the metro and shopping district.
The room was spotlessly clean and the staff were incredibly friendly and helpful.
However, I found it quite pricey for what you get. The breakfast was disappointing 
and the WiFi kept dropping. Overall it was a decent stay but I expected more 
for the price point. I'd give it 3.5 stars.
`;

async function main() {
  try {
    console.log('Parsing hotel review...\n');
    const structured = await parseHotelReview(exampleReview);
    console.log('Structured Review:');
    console.log(JSON.stringify(structured, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
