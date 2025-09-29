# Testing Class Assignment

## Steps to Test StudentClassesScreen

### 1. Check Current Data
- Start the backend server
- Check if there are any classes created
- Check if there are any students with classId assigned

### 2. Create Test Data
If no test data exists:

#### Create a Test Class
```bash
POST /api/classes
{
  "className": "Computer Science - Year 3 - Section A",
  "year": 3,
  "section": "A", 
  "department": "Computer Science"
}
```

#### Create Test Subjects
```bash
POST /api/subjects
{
  "subjectName": "Data Structures",
  "subjectCode": "CS301",
  "department": "Computer Science"
}

POST /api/subjects
{
  "subjectName": "Database Management",
  "subjectCode": "CS302", 
  "department": "Computer Science"
}
```

#### Create Test Faculty
```bash
POST /api/users
{
  "email": "faculty1@test.com",
  "password": "password123",
  "displayName": "Dr. John Smith",
  "role": "faculty",
  "department": "Computer Science",
  "username": "faculty1"
}
```

#### Assign Curriculum to Class
```bash
PUT /api/curriculum/classes/{classId}
{
  "assignments": [
    {
      "subjectId": "subject1_id",
      "facultyId": "faculty1_uid",
      "lecturesPerWeek": 3
    },
    {
      "subjectId": "subject2_id", 
      "facultyId": "faculty1_uid",
      "lecturesPerWeek": 2
    }
  ]
}
```

#### Assign Student to Class
```bash
PUT /api/users/{studentUid}
{
  "classId": "class_document_id"
}
```

### 3. Test the StudentClassesScreen
- Login as the test student
- Navigate to Classes screen
- Check if class information displays properly
- Verify subjects and faculty are shown correctly

### 4. Test Different Scenarios
- Student with no classId assigned
- Student with invalid classId
- Class with no curriculum
- Class with curriculum but missing subject/faculty data