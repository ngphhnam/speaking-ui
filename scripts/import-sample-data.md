# Import Sample Data for Testing

This guide shows you how to import the sample data into your API for testing.

## Option 1: Using Postman/Thunder Client

### Step 1: Create Topics

For each topic in `sample-data.json`, make a POST request to:
```
POST http://localhost:5000/api/topics
Content-Type: application/json
```

Example body:
```json
{
  "title": "Education System",
  "description": "Discuss the education system in your country, including its strengths and weaknesses.",
  "partNumber": 1,
  "difficultyLevel": "intermediate",
  "topicCategory": "Education",
  "keywords": ["education", "school", "university", "learning", "curriculum", "students", "teachers"]
}
```

### Step 2: Create Questions

After creating topics, note their IDs. Then for each question, make a POST request to:
```
POST http://localhost:5000/api/questions
Content-Type: application/json
```

Example body (replace `{topicId}` with actual topic ID):
```json
{
  "topicId": "{topicId}",
  "questionText": "What do you think are the main advantages and disadvantages of the education system in your country?",
  "questionType": "opinion",
  "suggestedStructure": "Introduction - State your view\nMain point 1 - Advantage with example\nMain point 2 - Disadvantage with example\nConclusion - Summary",
  "sampleAnswers": [
    "I think the main advantage is that education is accessible to everyone...",
    "The education system provides a solid foundation..."
  ],
  "keyVocabulary": ["curriculum", "accessible", "equality", "rigid", "creativity"],
  "estimatedBandRequirement": 6.5,
  "timeLimitSeconds": 120
}
```

## Option 2: Using cURL Script

Save the following as `import-data.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000/api"

# Create topics and store IDs
TOPIC_IDS=()

# Topic 1: Education System
RESPONSE=$(curl -s -X POST "$API_URL/topics" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Education System",
    "description": "Discuss the education system in your country, including its strengths and weaknesses.",
    "partNumber": 1,
    "difficultyLevel": "intermediate",
    "topicCategory": "Education",
    "keywords": ["education", "school", "university", "learning", "curriculum", "students", "teachers"]
  }')
TOPIC_ID=$(echo $RESPONSE | jq -r '.id')
TOPIC_IDS+=($TOPIC_ID)
echo "Created topic: Education System (ID: $TOPIC_ID)"

# Add more topics...
# (Continue for all topics)

# Then create questions using the topic IDs
# Question 1
curl -X POST "$API_URL/questions" \
  -H "Content-Type: application/json" \
  -d "{
    \"topicId\": \"$TOPIC_ID\",
    \"questionText\": \"What do you think are the main advantages and disadvantages of the education system in your country?\",
    \"questionType\": \"opinion\",
    \"suggestedStructure\": \"Introduction - State your view\\nMain point 1 - Advantage with example\\nMain point 2 - Disadvantage with example\\nConclusion - Summary\",
    \"sampleAnswers\": [\"I think the main advantage is that education is accessible to everyone...\", \"The education system provides a solid foundation...\"],
    \"keyVocabulary\": [\"curriculum\", \"accessible\", \"equality\", \"rigid\", \"creativity\"],
    \"estimatedBandRequirement\": 6.5,
    \"timeLimitSeconds\": 120
  }"
```

## Option 3: Using JavaScript/Node.js Script

Create `import-data.js`:

```javascript
const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
const sampleData = JSON.parse(fs.readFileSync('./sample-data.json', 'utf8'));

async function importData() {
  const topicIds = [];
  
  // Create topics
  for (const topic of sampleData.topics) {
    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic)
      });
      const created = await response.json();
      topicIds.push(created.id);
      console.log(`✓ Created topic: ${topic.title} (ID: ${created.id})`);
    } catch (error) {
      console.error(`✗ Failed to create topic: ${topic.title}`, error.message);
    }
  }
  
  // Create questions
  for (let i = 0; i < sampleData.questions.length; i++) {
    const question = sampleData.questions[i];
    const topicIndex = i % topicIds.length; // Distribute questions across topics
    const questionWithTopic = { ...question, topicId: topicIds[topicIndex] };
    
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionWithTopic)
      });
      const created = await response.json();
      console.log(`✓ Created question for topic ${topicIndex + 1} (ID: ${created.id})`);
    } catch (error) {
      console.error(`✗ Failed to create question ${i + 1}`, error.message);
    }
  }
  
  console.log('\n✅ Import complete!');
}

importData();
```

Run with: `node import-data.js`

## Option 4: Manual Import via Frontend

1. Navigate to `/topics/create` in your app
2. Use the "Create Topic" tab to add topics one by one
3. Switch to "Add Question" tab and select a topic
4. Fill in the question form and submit

## Quick Test Data

For quick testing, here are 3 essential topics with 1 question each:

### Topic 1: Education System (Part 1, Intermediate)
**Question:** "What do you think are the main advantages and disadvantages of the education system in your country?"

### Topic 2: Memorable Journey (Part 2, Beginner)  
**Question:** "Describe a journey you have taken that was particularly memorable."

### Topic 3: Technology Impact (Part 3, Advanced)
**Question:** "How has technology changed the way we work and communicate in the modern world?"


