# Sub-domains
+ admin.endeavor.com
+ teach.endeavor.com
+ study.endeavor.com

# User service
+ user admin APIs: create, read, update, delete
+ authentication: JWT
```mermaid
sequenceDiagram
    participant Browser
    participant User_Service
    participant Another_Service
    Browser ->> User_Service: authentication request
    alt invalid username or password
        User_Service -->> Browser: Notification of failed authentication
        Browser ->> Browser: Show failed authentication message
    else valid username and password
        User_Service -->> Browser: JWT token
        Browser ->> Browser: Show student page
        Browser ->> Another_Service: request with JWT token
    end
```

# Admin service
+ user admin APIs
+ create course
+ approve change requests
+ publish course
+ student-course permission
+ teacher-course permission

# Teacher service
+ submit change requests 
+ search and suggestion

# Course service
+ list courses
+ preview courses
+ list lessons

# Lesson service
+ preview lesson
+ modify lesson
+ study lesson

# Word service

# Grammar service

# Deck service