# Business Specification

The Endeavor application is a web application that provides 3 main functionalities for 3 types of users:

- Students can study English courses.
- Teachers can modify English courses.
- Admins can manage students, teachers.

<img src="./images/Context Diagram.excalidraw.svg" width="700">

The **online courses** are mainly used as complementary materials for offline courses provided by Endeavor English Center (ECC).

## Courses

In Endeavor, A course is a collection of lessons.

Also, courses are assigned and access-controlled as a whole.

See [Courses](./Courses/README.md) for more details.

## Lessons

A lesson is the core educational unit that users interact with. It serves as both a learning material and a structured container of knowledge for a specific topic.

A lesson must be part of a course - it cannot be created independently.

See [Lessons](./Lessons/README.md) for more details.

## Admin

Admins have the highest priviledge in the app.

- They can, for example, add or remove users, change user role.
- They also have all permissions for all courses.

## Teachers

Teachers are EEC employees.
For courses that admins grant access to, a teacher can:

- preview content of the course
- make a modified verision of the course
- submit a change request to admins

## Students

Students are mainly EEC students.  
A student will be provided access to an online course free-of-charge if he/she has registered the corresponding offline course. He/she then can:

- study the course

## Functionalities

Functionalities are defined using triples of form `[user, resource, action]`: a `user` perform and `action` on a `resource`.

Note: an alternative to this is to use couples of form [`resource`, `action`] (without the `user` - relation with `user` are defined in RBAC policies). In this approach, it's challenging to name the `action` in a non-ambiguous way. For example, view of a lesson from a `teacher`'s perspective may be different from that of a `student`. So the couple [`lesson`, `view`] is ambiguous. We may add qualifier such as [`lesson`, `teacher-view`] and [`lesson`, `student-view`], but this is not elegant. The use of triple also has an important advantage of being user-centric.

### Teacher

| User    | Resource     | Action | Note                                                  |
| ------- | ------------ | ------ | ----------------------------------------------------- |
| teacher | course_draft | create | A teacher can create new course drafts.               |
| teacher | course-draft | view   | A teacher can view a modified version of a course.    |
| teacher | course-draft | modify | A teacher can modify a modified version of a course.  |
| teacher | course-draft | submit | A teacher can submit his draft to admin for approval. |
| teacher | course       | view   | A teacher can (pre)view all courses.                  |

### Student

| User    | Resource | Action | Note                        |
| ------- | -------- | ------ | --------------------------- |
| student | course   | view   | Only when access is granted |

### Admin

| User    | Resource       | Action              | Note                                                              |
| ------- | -------------- | ------------------- | ----------------------------------------------------------------- |
| admin   | course_draft   | create              | An admin can create new course drafts.                            |
| admin   | course_draft   | view                | An admin can (pre)view all course drafts.                         |
| admin   | course-draft   | modify              | An admin can create a modified version of a course when assigned. |
| admin   | course-draft   | approve             | An admin can approve course draft.                                |
| admin   | course         | publish             | An admin can publish a course.                                    |
| admin   | course         | unpublish           | An admin can hide/remove course from public.                      |
| admin   | course         | grant-student-study | An admin can grant course study permission to students.           |
| admin   | course         | study               | An admin can study (any) course.                                  |
