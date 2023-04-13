import { CommentOptions } from "./types"
import payload from "payload"
import { Request, Response } from "express"
import { Where } from "payload/types"
import { Field, FieldBase } from "payload/dist/fields/config/types"

export default async function hasPublishedComment(
  { body }: Request,
  res: Response<any, Record<string, any>>,
  options: CommentOptions,
) {
  const { fields, hasPublishedCommentFields, slug } = options
  const isInvalid = getIsInvalid(body, slug, hasPublishedCommentFields, fields)

  if (isInvalid) return res.status(200).json({ hasPublishedComment: false })

  const where = getWhere(body, hasPublishedCommentFields)
  const hasPublishedComment = await getHasPublishedComment(slug, where)

  return res.status(200).json({ hasPublishedComment })
}

function hasMissingFields(
  body: object,
  fields: Field[],
  hasPublishedCommentFields: string[],
) {
  const fieldsWithNames = fields as FieldBase[]
  const fieldsNotInCollection = hasPublishedCommentFields.filter(fieldName => {
    return !fieldsWithNames.find(({ name }) => name === fieldName)
  })
  const fieldsNotInBody = hasPublishedCommentFields.filter(field => {
    return !body.hasOwnProperty(field)
  })

  return !!(fieldsNotInCollection.length)
}

function getIsInvalid(
  body: any,
  slug: string,
  hasPublishedCommentFields: string[],
  fields: Field[],
) {
  return !!(
    !body ||
    typeof body !== 'object' ||
    !slug ||
    !hasPublishedCommentFields.length ||
    hasMissingFields(body, fields, hasPublishedCommentFields)
  )
}

function getWhere(body: any, hasPublishedCommentFields: string[]): Where {
  const where: Where[] = [{
    isApproved: {
      equals: true
    }
  }]

  hasPublishedCommentFields.forEach(field => {
    const bodyFieldVal = body[field]
    const whereParam: Where = {}
    
    if (bodyFieldVal) {
      whereParam[field] = { equals: bodyFieldVal }
      where.push(whereParam)
    }
  })

  return { and: where }
}

async function getHasPublishedComment(slug: string, where: Where) {
  const { docs } = await payload.find({
    collection: slug,
    limit: 1,
    where,
  })
  
  return docs?.length > 0
}
