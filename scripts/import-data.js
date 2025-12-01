/**
 * Script to import sample data into the API
 * 
 * Usage: node scripts/import-data.js
 * 
 * Make sure your API is running on http://localhost:5000
 */

const fs = require('fs');
const path = require('path');

// Check if fetch is available (Node 18+) or use node-fetch
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch {
  console.error('Please install node-fetch: npm install node-fetch');
  process.exit(1);
}

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const SAMPLE_DATA_PATH = path.join(__dirname, '..', 'sample-data.json');

async function importData() {
  console.log('🚀 Starting data import...\n');
  console.log(`API URL: ${API_URL}\n`);

  // Read sample data
  let sampleData;
  try {
    const data = fs.readFileSync(SAMPLE_DATA_PATH, 'utf8');
    sampleData = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read sample-data.json:', error.message);
    process.exit(1);
  }

  const topicIds = [];
  const errors = [];

  // Step 1: Create topics
  console.log('📝 Creating topics...\n');
  for (let i = 0; i < sampleData.topics.length; i++) {
    const topic = sampleData.topics[i];
    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const created = await response.json();
      topicIds.push(created.id);
      console.log(`  ✓ [${i + 1}/${sampleData.topics.length}] Created: "${topic.title}" (ID: ${created.id})`);
    } catch (error) {
      errors.push({ type: 'topic', name: topic.title, error: error.message });
      console.error(`  ✗ [${i + 1}/${sampleData.topics.length}] Failed: "${topic.title}" - ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${topicIds.length}/${sampleData.topics.length} topics\n`);

  // Step 2: Create questions
  console.log('❓ Creating questions...\n');
  let questionCount = 0;

  for (let i = 0; i < sampleData.questions.length; i++) {
    const question = sampleData.questions[i];
    // Distribute questions across topics (round-robin)
    const topicIndex = i % topicIds.length;
    const questionWithTopic = {
      ...question,
      topicId: topicIds[topicIndex],
    };

    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionWithTopic),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const created = await response.json();
      questionCount++;
      const topicTitle = sampleData.topics[topicIndex].title;
      console.log(
        `  ✓ [${i + 1}/${sampleData.questions.length}] Created question for "${topicTitle}" (ID: ${created.id})`
      );
    } catch (error) {
      errors.push({ type: 'question', index: i + 1, error: error.message });
      console.error(`  ✗ [${i + 1}/${sampleData.questions.length}] Failed to create question - ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${questionCount}/${sampleData.questions.length} questions\n`);

  // Summary
  console.log('📊 Import Summary:');
  console.log(`   Topics: ${topicIds.length}/${sampleData.topics.length}`);
  console.log(`   Questions: ${questionCount}/${sampleData.questions.length}`);
  console.log(`   Errors: ${errors.length}\n`);

  if (errors.length > 0) {
    console.log('⚠️  Errors encountered:');
    errors.forEach((err) => {
      if (err.type === 'topic') {
        console.log(`   Topic "${err.name}": ${err.error}`);
      } else {
        console.log(`   Question ${err.index}: ${err.error}`);
      }
    });
    console.log('');
  }

  if (topicIds.length > 0 && questionCount > 0) {
    console.log('🎉 Import completed successfully!');
    console.log(`\n💡 You can now:\n   1. Visit http://localhost:3000/topics to browse topics`);
    console.log(`   2. Visit http://localhost:3000/topics/create to create more`);
  } else {
    console.log('⚠️  No data was imported. Please check your API connection.');
    process.exit(1);
  }
}

// Run the import
importData().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


