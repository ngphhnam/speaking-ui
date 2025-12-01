# Sample Data for Testing

This directory contains sample data to help you test the Topics and Questions functionality.

## Quick Start

1. **Make sure your API is running** on `http://localhost:5000` (or update the API_URL in the script)

2. **Run the import script:**
   ```bash
   npm run import-data
   ```
   
   Or directly:
   ```bash
   node scripts/import-data.js
   ```

3. **Verify the data:**
   - Visit `http://localhost:3000/topics` to see all imported topics
   - Browse and filter topics
   - Check that questions are associated with topics

## What's Included

### Topics (10 total)
- **Part 1 Topics** (4): Education System, Work and Career, Hobbies and Interests, Food and Culture
- **Part 2 Topics** (3): Memorable Journey, Person Who Influenced You, Place to Visit
- **Part 3 Topics** (3): Technology and Society, Climate Change, Social Media

### Questions (10 total)
- Each question is distributed across topics
- Includes various question types: personal, opinion, describe, discuss
- Band requirements range from 5.0 to 7.5
- Includes sample answers, vocabulary, and suggested structures

## Sample Data Structure

### Topic Example
```json
{
  "title": "Education System",
  "description": "Discuss the education system in your country...",
  "partNumber": 1,
  "difficultyLevel": "intermediate",
  "topicCategory": "Education",
  "keywords": ["education", "school", "university", "learning"]
}
```

### Question Example
```json
{
  "questionText": "What do you think are the main advantages...",
  "questionType": "opinion",
  "suggestedStructure": "Introduction - State your view\n...",
  "sampleAnswers": ["Answer 1...", "Answer 2..."],
  "keyVocabulary": ["curriculum", "accessible", "equality"],
  "estimatedBandRequirement": 6.5,
  "timeLimitSeconds": 120
}
```

## Manual Import Options

If you prefer to import manually:

1. **Via Frontend UI:**
   - Go to `/topics/create`
   - Use the "Create Topic" tab
   - Then use "Add Question" tab

2. **Via API directly:**
   - Use Postman/Thunder Client
   - See `scripts/import-sample-data.md` for detailed instructions

## Customizing the Data

Edit `sample-data.json` to:
- Add more topics
- Add more questions
- Modify existing data
- Change difficulty levels or categories

Then run the import script again (it will create duplicates, so you may want to clear existing data first).

## Troubleshooting

**Error: "Failed to connect"**
- Make sure your API is running on `http://localhost:5000`
- Check the API_URL in the script matches your API port

**Error: "Topic with slug already exists"**
- The topic already exists in your database
- Delete existing topics or modify the sample data

**Questions not showing up**
- Make sure topics were created successfully first
- Check that topicId is correctly associated with questions

## Next Steps

After importing:
1. ✅ Browse topics at `/topics`
2. ✅ Test filtering by part, category, difficulty
3. ✅ Create new topics/questions via `/topics/create`
4. ✅ Test the speaking practice flow with real topics


