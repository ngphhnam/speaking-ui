# Topic PartNumber Flow Documentation

## 📋 Tổng quan

Flow tạo và quản lý topic với logic mới:
- **Part 2 & Part 3** được gộp thành một option trên UI
- Database luôn lưu `part_number = 2` cho cả "Part 2" và "Part 2 & Part 3"
- Phân biệt Part 2 và Part 3 dựa vào `question_type` trong bảng `questions`

## 🔄 Flow Mapping

### UI → Database Mapping

| UI Selection | Database Value | Giải thích |
|--------------|----------------|------------|
| "Part 1" | `part_number = 1` | Topic chỉ có PART1 questions |
| "Part 2" | `part_number = 2` | Topic có PART2 questions (cue card) |
| "Part 2 & Part 3" | `part_number = 2` | Topic có cả PART2 và PART3 questions |

### Database → UI Mapping (Edit Topic)

| Database Value | Has PART3 Questions? | UI Display |
|----------------|----------------------|------------|
| `part_number = 1` | N/A | "Part 1" |
| `part_number = 2` | ❌ No | "Part 2" |
| `part_number = 2` | ✅ Yes | "Part 2 & Part 3" |
| `part_number = 3` | N/A | "Part 3" (if exists) |

## 🎯 Implementation Details

### 1. **CreateTopic Component** (`src/components/topics/CreateTopic.tsx`)

**Part Options:**
```typescript
const partOptions = [
  { value: "1", label: "Part 1: Introduction & Interview" },
  { value: "2", label: "Part 2: Long Turn" },
  { value: "2&3", label: "Part 2 & Part 3: Long Turn & Discussion" },
];
```

**Mapping Function:**
```typescript
const mapPartNumberToDatabase = (uiValue: string): number | undefined => {
  if (!uiValue) return undefined;
  
  // "2&3" means Part 2 & Part 3, map to database value 2
  if (uiValue === "2&3") {
    return 2;
  }
  
  const num = Number(uiValue);
  return isNaN(num) ? undefined : num;
};
```

**API Call:**
```typescript
const partNumber = mapPartNumberToDatabase(topicForm.partNumber);
await createTopic({
  partNumber: partNumber, // "2&3" → 2
  ...
});
```

### 2. **EditTopic Component** (`src/components/topics/EditTopic.tsx`)

**Reverse Mapping (Database → UI):**
```typescript
const mapDatabaseToUI = (partNumber: number | null | undefined, hasPart3Questions: boolean): string => {
  if (!partNumber) return "";
  
  // If partNumber is 2 and has PART3 questions, show "2&3"
  if (partNumber === 2 && hasPart3Questions) {
    return "2&3";
  }
  
  return partNumber.toString();
};
```

**Load Topic:**
```typescript
// Check if topic has PART3 questions
const hasPart3Questions = useMemo(() => {
  if (!Array.isArray(questions)) return false;
  return questions.some((q) => q.questionType === "PART3");
}, [questions]);

// Map to UI value
const uiPartNumber = mapDatabaseToUI(topic.partNumber, hasPart3Questions);
setTopicForm({ partNumber: uiPartNumber });
```

### 3. **TopicDetail Component** (`src/components/topics/TopicDetail.tsx`)

**Filter Logic:**
```typescript
const filteredQuestions = useMemo(() => {
  if (!Array.isArray(questions)) return [];
  if (!topic?.partNumber) return questions;
  
  if (topic.partNumber === 1) {
    return questions.filter((q) => q.questionType === "PART1");
  } else if (topic.partNumber === 2) {
    // Part 2 topics can have both PART2 and PART3 questions
    return questions.filter((q) => 
      q.questionType === "PART2" || q.questionType === "PART3"
    );
  } else if (topic.partNumber === 3) {
    return questions.filter((q) => q.questionType === "PART3");
  }
  
  return questions;
}, [questions, topic?.partNumber]);
```

## 📊 Database Schema

### Topics Table
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  part_number INTEGER,  -- 1, 2, or 3
  ...
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  question_type VARCHAR(10),  -- 'PART1', 'PART2', 'PART3'
  question_text TEXT,
  ...
);
```

## 🔍 Query Examples

### Get Part 2 Questions Only
```sql
SELECT * FROM questions 
WHERE topic_id = 'xxx' 
  AND question_type = 'PART2';
```

### Get Part 3 Questions Only
```sql
SELECT * FROM questions 
WHERE topic_id = 'xxx' 
  AND question_type = 'PART3';
```

### Get All Questions for Part 2 Topic
```sql
SELECT * FROM questions 
WHERE topic_id = 'xxx' 
  AND question_type IN ('PART2', 'PART3');
```

## 🎨 User Experience Flow

### Scenario 1: Create Topic "Part 2 & Part 3"

1. **User Action:**
   - Chọn "Part 2 & Part 3: Long Turn & Discussion" từ dropdown

2. **UI Processing:**
   ```typescript
   topicForm.partNumber = "2&3"
   ```

3. **Mapping:**
   ```typescript
   mapPartNumberToDatabase("2&3") → 2
   ```

4. **API Request:**
   ```json
   {
     "title": "Describe a Hobby",
     "partNumber": 2
   }
   ```

5. **Database:**
   ```sql
   INSERT INTO topics (title, part_number) 
   VALUES ('Describe a Hobby', 2);
   ```

6. **Result:**
   - Topic được tạo với `part_number = 2`
   - User có thể thêm cả PART2 và PART3 questions vào topic này

### Scenario 2: Edit Topic with PART3 Questions

1. **Load Topic:**
   - Database: `part_number = 2`
   - Questions: Có cả PART2 và PART3

2. **Check PART3:**
   ```typescript
   hasPart3Questions = true
   ```

3. **Map to UI:**
   ```typescript
   mapDatabaseToUI(2, true) → "2&3"
   ```

4. **Display:**
   - Dropdown hiển thị: "Part 2 & Part 3: Long Turn & Discussion"

5. **User Changes:**
   - Có thể giữ nguyên hoặc đổi sang "Part 2" (nếu xóa hết PART3 questions)

### Scenario 3: View Topic Page

1. **Topic Loaded:**
   - `part_number = 2`

2. **Questions Filtered:**
   ```typescript
   // Shows both PART2 and PART3 questions
   filteredQuestions = questions.filter(q => 
     q.questionType === "PART2" || q.questionType === "PART3"
   );
   ```

3. **Display:**
   - Hiển thị tất cả PART2 và PART3 questions
   - User có thể phân biệt qua `questionType` field

## ✅ Components Updated

1. ✅ `src/components/topics/CreateTopic.tsx`
   - Added "Part 2 & Part 3" option
   - Added mapping function
   - Updated API call

2. ✅ `src/components/topics/EditTopic.tsx`
   - Added "Part 2 & Part 3" option
   - Added reverse mapping (check PART3 questions)
   - Updated load and save logic

3. ✅ `src/components/topics/CreateTopicQuestion.tsx`
   - Added "Part 2 & Part 3" option
   - Added mapping function

4. ✅ `src/components/topics/TopicDetail.tsx`
   - Updated filter to show PART2 + PART3 when partNumber = 2

5. ✅ `src/i18n/config.ts`
   - Added translations for part options

## 🌍 Translations

### English
```typescript
part1: "Part 1: Introduction & Interview"
part2: "Part 2: Long Turn"
part2And3: "Part 2 & Part 3: Long Turn & Discussion"
```

### Vietnamese
```typescript
part1: "Part 1: Introduction & Interview"
part2: "Part 2: Long Turn"
part2And3: "Part 2 & Part 3: Long Turn & Discussion"
```

*(Note: Part names are kept in English as they are technical IELTS test part names)*

## 🧪 Testing Checklist

- [ ] Create topic with "Part 1" → Database has `part_number = 1`
- [ ] Create topic with "Part 2" → Database has `part_number = 2`
- [ ] Create topic with "Part 2 & Part 3" → Database has `part_number = 2`
- [ ] Edit topic with `part_number = 2` and no PART3 questions → Shows "Part 2"
- [ ] Edit topic with `part_number = 2` and has PART3 questions → Shows "Part 2 & Part 3"
- [ ] View topic page with `part_number = 2` → Shows both PART2 and PART3 questions
- [ ] View topic page with `part_number = 1` → Shows only PART1 questions
- [ ] Translations work correctly in both EN and VI

## 📝 Notes

1. **Backward Compatibility:**
   - Existing topics with `part_number = 2` will automatically show "Part 2 & Part 3" if they have PART3 questions
   - Topics without PART3 questions will show "Part 2"

2. **Question Creation:**
   - When creating questions for a topic with `part_number = 2`, user can choose `questionType = "PART2"` or `"PART3"`
   - Both types can coexist in the same topic

3. **Filter Logic:**
   - TopicDetail automatically filters questions based on partNumber
   - Part 2 topics show both PART2 and PART3 questions
   - Part 1 topics show only PART1 questions

---

**Status**: ✅ Complete
**Last Updated**: December 12, 2025














