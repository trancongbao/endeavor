'use server'
import { revalidatePath } from 'next/cache'
import { CardKey, EndeavorDB, kysely, Lesson, LessonKey } from './db/kysely'
import { EndeavorDB, kysely, Lesson, LessonKey } from './db/kysely'
import path from 'path'
import { promises as fs } from 'fs'
import { sql, Transaction } from 'kysely'

export async function addSubdeck(formData: FormData) {
  const addedSubdeck = await kysely
    .insertInto('lesson')
    .values({
      course_id: parseInt(formData.get('courseId') as string),
      order: parseInt(formData.get('order') as string),
      title: formData.get('title') as string,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  console.log('Added subdeck: ', addedSubdeck)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function deleteSubdeck({ course_id, order }: LessonKey) {
  console.log(`deleteSubdeck: courseId = ${course_id}, subdeckOrder = ${order}`)
  const deletedSubdeck = await kysely
    .deleteFrom('lesson')
    .where(sql<boolean>`(course_id, "order") = (${course_id}, ${order})`)
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Deleted subdeck: ', deletedSubdeck)
  revalidatePath('/teacher/decks/[id]', 'page')
  //TODO: Delete all cards in the subdeck
}

export async function editSubdeckTitle({ course_id, order }: LessonKey, newSubdeckTitle: string) {
  console.log('editSubdeckTitle: course_id = ', course_id)
  const updatedSubdeck = await kysely
    .updateTable('lesson')
    .where(sql<boolean>`(course_id, "order") = (${course_id}, ${order})`)
    .set({
      title: newSubdeckTitle,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Updated subdeck: ', updatedSubdeck)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function addCard(formData: FormData) {
  console.log('addCard: formData = ', formData)
  const addedCard = await kysely
    .insertInto('card')
    .values({
      course_id: parseInt(formData.get('courseId') as string),
      lesson_order: parseInt(formData.get('lessonOrder') as string),
      order: parseInt(formData.get('order') as string),
      text: formData.get('text') as string,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  console.log('Added card: ', addedCard)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function deleteCard({ course_id, lesson_order, order }: CardKey) {
  console.log(`deleteCard: courseId = ${course_id}, lesson_order = ${lesson_order}, order = ${order}`)
  const deletedSubdeck = await kysely
    .deleteFrom('card')
    .where(sql<boolean>`(course_id, lesson_order, "order") = (${course_id}, ${lesson_order}, ${order})`)
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Deleted subdeck: ', deletedSubdeck)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function editCardText({ course_id, lesson_order, order }: CardKey, newCardText: string) {
  console.log('editCardText: courseId = ', course_id)
  const updatedCard = await kysely
    .updateTable('card')
    .where(sql<boolean>`(course_id, lesson_order, "order") = (${course_id}, ${lesson_order}, ${order})`)
    .set({
      text: newCardText,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Updated card: ', updatedCard)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function addWordToCard(
  { course_id, lesson_order, order }: CardKey,
  wordText: string,
  wordDefinition: string,
  startIndex: number,
  endIndex: number,
  trx?: Transaction<EndeavorDB>
) {
  console.log(
    `addWordToCard: course_id = ${course_id}, lesson_order = ${lesson_order}, card_order = ${order}, wordText = ${wordText}, wordDefinition = ${wordDefinition}, startIndex = ${startIndex}, endIndex = ${endIndex}`
  )
  const addedCardWord = await (trx || kysely)
    .insertInto('card_word')
    .values({
      course_id,
      lesson_order,
      card_order: order,
      word_text: wordText,
      word_definition: wordDefinition,
      start_index: startIndex,
      end_index: endIndex,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Added card word: ', addedCardWord)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function removeWordFromCard(
  { course_id, lesson_order, order }: CardKey,
  wordText: string,
  wordDefinition: string,
  trx?: Transaction<EndeavorDB>
) {
  console.log(
    `removeWordFromCard: course_id = ${course_id}, lesson_order = ${lesson_order}, card_order = ${order}, wordText = ${wordText}, wordDefinition = ${wordDefinition}`
  )
  const deletedCardWord = await (trx || kysely)
    .deleteFrom('card_word')
    .where(sql<boolean>`(course_id, lesson_order, card_order) = (${course_id}, ${lesson_order}, ${order})`)
    .where('word_text', '=', wordText)
    .where('word_definition', '=', wordDefinition)
    .returningAll()
    .executeTakeFirstOrThrow()
  console.log('Deleted card word: ', deletedCardWord)
  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function replaceWordInCard(currentWord: any, newWord: any) {
  console.log(`replaceWordInCard: currentWord = ${JSON.stringify(currentWord)}, newWord = ${JSON.stringify(newWord)}`)
  await kysely.transaction().execute(async (trx) => {
    removeWordFromCard(
      currentWord.courseId,
      currentWord.lessonOrder,
      currentWord.cardOrder,
      currentWord.text,
      currentWord.definition,
      trx
    )
    addWordToCard(
      newWord.courseId,
      newWord.lessonOrder,
      newWord.cardOrder,
      newWord.text,
      newWord.definition,
      newWord.startIndex,
      newWord.endIndex,
      trx
    )
  })

  revalidatePath('/teacher/decks/[id]', 'page')
}

export async function uploadWordImage(formData: FormData): Promise<string | undefined> {
  const text = formData.get('text') as string
  const image = formData.get('image') as File
  console.log(`uploadWordImage: text=${text} image=${image.name}`)
  const publicDir = path.join(process.cwd(), 'public')

  // Ensure the uploads directory exists
  await fs.mkdir(publicDir, { recursive: true })

  const uniqueImageSrc = await generateUniqueImageSrc(publicDir, text, path.parse(image.name).ext)

  // Save the file
  try {
    await fs.writeFile(path.join(publicDir, uniqueImageSrc), new Uint8Array(await image.arrayBuffer()))
    return uniqueImageSrc
  } catch (error) {
    console.error('Error uploading the file:', error)
    return undefined
  }

  // Helper function to generate a unique file name by adding a suffix if needed
  async function generateUniqueImageSrc(uploadDir: string, fileName: string, fileExtension: string): Promise<string> {
    let counter = 1
    let uniqueFilename = `${fileName}${fileExtension}`

    // Check if the file already exists
    while (await fileExists(path.join(uploadDir, uniqueFilename))) {
      // Add a suffix (e.g., _2, _3) if a file with the same name exists
      counter++
      uniqueFilename = `${fileName}_${counter}${fileExtension}`
    }
    return `/words/${uniqueFilename}`
  }

  // Check if a file exists
  async function fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch (error) {
      return false // File does not exist
    }
  }
}

export async function addWord(formData: FormData) {
  const text = formData.get('text') as string
  const definition = formData.get('definition') as string
  const imageSrc = formData.get('imageSrc') as string
  console.log(`addWord: text=${text}, definition=${definition}, imageSrc=${imageSrc}`)

  const addedWord = await kysely
    .insertInto('word')
    .values({
      text,
      definition,
      image_uri: imageSrc,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return addedWord
}

export async function updateWord(formData: FormData) {
  console.log(`updateWord: formData=${formData}`)

  const updatedWord = await kysely
    .updateTable('word')
    .where('text', '=', formData.get('text') as string)
    .where('definition', '=', formData.get('definition') as string)
    .set({
      text: formData.get('text') as string,
      definition: formData.get('definition') as string,
      image_uri: formData.get('imageSrc') as string,
    })
    .returningAll()
    .executeTakeFirst()

  if (updatedWord) {
    return { updatedWord }
  } else {
    console.log('Word does not exist in the database.')
    const addedWord = await addWord(formData)
    return { addedWord }
  }
}
