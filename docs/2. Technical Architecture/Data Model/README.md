# Data Model

## Relational vs. Non-relational Data Model

There are a lots of many-to-many relationships.

- Words and Cards
- Students and Cards
- Students and Lessons
- Students and Courses
- Teachers and Courses
- etc.

Let's take `Words and Cards` as an example. In MongoDB, there are 2 ways you can do this.

- If you decide to go with `referencing` like in relational design, then for simply fetching words belong to a card 2 `lookup`s are needed and you still have problems with data integrity, since MongoDB doesn’t support foreign keys.
- If you decide to go with `embedding` and storing words in a card document as an array, then getting words in a card (from a student perspective) will be faster, but getting list of cards that a word belongs to (from a teacher perspective) will be very slow. You can store word ids in a card document and card ids in a word document, but then we have duplication and we need to deal with update/delete anomalies.

Even for current one-to-many relationships, as the app evolves

So it's better to use a RMDB with `json` support such as `PostgresSQL`.

## Overview

```mermaid
erDiagram
  TEACHER_COURSE }|--|{ TEACHER: has
  TEACHER_COURSE }|--|{ COURSE: has

  STUDENT_COURSE }|--|{ STUDENT: has
  STUDENT_COURSE }|--|{ COURSE: has

  COURSE ||--|{ LESSON: has

  TEACHER_COURSE {
    string teacher_username PK
    integer course_id PK
  }

  STUDENT_COURSE {
    string student_username PK
    integer course_id PK
  }

  TEACHER {
    string username PK
    string password "not null"
    string surname "not null"
    string given_name "not null"
    string email "not null"
    string phone "not null"
    date date_of_birth "not null"
    string address "not null"
    string avatar "url to the avatar image"
  }

  STUDENT {
    string username PK
    string password "not null"
    string surname "not null"
    string given_name "not null"
    string email
    string phone
    date date_of_birth "not null"
    string address "not null"
    string avatar "url to the avatar image"
    integer proficiency "student's proficiency score"
    }

  COURSE {
    integer id            PK
    enum    status            "DRAFT, IN_REVIEW, APPROVED, PUBLISHED, or ARCHIVED"
    string  title             "not null"
    integer level             "not null"
    string  summary
    string  description
    string  thumbnail
    date    updated_at        "not null"
  }

  LESSON {
    integer id            PK
    integer course_id     FK  "id of the course that the lesson belongs"
    integer order             "order of the lesson in the course, not null"
    string  title             "not null"
    string  audio             "not null"
    string  summary
    string  description
    string  thumbnail
    string  content
    date    updated_at        "not null"
  }
```

## Users

There are 3 sub-domains having independent authentication/authorization needs. Therefore, 3 separate database tables are used.  
Basic authentication is used, as it is simple but sufficient. Email is not chosen as login username because young students may not have emails. UUID is difficult to remember. So for each student, a unique username acts as both the primary key and the login username and is created as follows:

- Step 1: concatenate the user's given name and surname (in that order) with underscore "`_`" as separator.
- Step 2: if the username from step 1 is not unique, append an underscore "`_`" and a counter starting from `2`.

```mermaid
erDiagram
    ADMIN {
        string username PK
        string password "not null"
        string surname "not null"
        string given_name "not null"
        string email "not null"
        string phone "not null"
        date date_of_birth "not null"
        string address "not null"
        string avatar "url to the avatar image"
    }
    TEACHER {
        string username PK
        string password "not null"
        string surname "not null"
        string given_name "not null"
        string email "not null"
        string phone "not null"
        date date_of_birth "not null"
        string address "not null"
        string avatar "url to the avatar image"
    }
    STUDENT {
        string username PK
        string password "not null"
        string surname "not null"
        string given_name "not null"
        string email
        string phone
        date date_of_birth "not null"
        string address "not null"
        string avatar "url to the avatar image"
        integer proficiency "student's proficiency score"
    }
```

## Resources

See [Lesson](./Lessons/README.md) for more details.
