import { Pool } from 'pg'
import { Kysely, PostgresDialect, Generated, ColumnType } from 'kysely'
import { extend } from 'lodash'

export { kysely, CourseStatus }
export type { EndeavorDB, Admin, Teacher, Student, Course, LessonKey, Lesson, CardKey, Card, Word, TeacherCourse }
export type { EndeavorDB, Admin, Teacher, Student, Course, LessonKey, Lesson, Card, Word, TeacherCourse }

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'app',
  password: 'password',
  database: 'postgres',
  max: 10,
})

const postgresDialect = new PostgresDialect({ pool })

const kysely = new Kysely<EndeavorDB>({ dialect: postgresDialect })

interface EndeavorDB {
  admin: Admin
  teacher: Teacher
  student: Student
  teacher_course: TeacherCourse
  course: Course
  lesson: Lesson
  card: Card
  word: Word
  card_word: CardWord
}

interface Admin {
  username: string
  password: string
  surname: string
  given_name: string
  email: string
  phone: string
  date_of_birth: Date
  address: string
  avatar?: string
}

interface Student {
  username: string
  password: string
  surname: string
  given_name: string
  email: string
  phone: string
  date_of_birth: Date
  address: string
  avatar: string
  proficiency: number
}

interface Teacher {
  username: string
  password: string
  surname: string
  given_name: string
  email: string
  phone: string
  date_of_birth: Date
  address: string
  avatar?: string
}

interface TeacherCourse {
  teacher_username: string
  course_id: number
}

//TODO: We should use level + title as a composite key
interface Course {
  id: Generated<number>
  level: number
  title: string
  version: string
  status: CourseStatus
  summary?: string
  description?: string
  thumbnail?: string
  updated_at: ColumnType<Date, string | undefined, never>
}

enum CourseStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

interface LessonKey {
  course_id: number
  order: number
}

interface Lesson extends LessonKey {
  title: string
  audio?: string
  summary?: string
  description?: string
  thumbnail?: string
  content?: string
  updated_at: ColumnType<Date, string | undefined, never>
}

interface CardKey {
  course_id: number
  lesson_order: number
  order: number
}

interface Card extends CardKey {
  text: string
  audio_uri?: string
}

interface Word {
  text: string
  definition: string
  phonetic?: string
  part_of_speech?: string
  audio_uri?: string
  image_uri?: string
}

interface CardWord {
  course_id: number
  lesson_order: number
  card_order: number
  word_text: string
  word_definition: string
  start_index: number
  end_index: number
}
