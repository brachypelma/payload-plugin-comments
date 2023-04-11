import { CommentOptions } from "./types"
import payload from "payload"
import { Request, Response } from "express"
import { Where } from "payload/types"
import { FieldBase } from "payload/dist/fields/config/types"

export default async function hasPublishedComment(
  { body }: Request,
  res: Response<any, Record<string, any>>,
  options: CommentOptions,
) {
  const { fields, hasPublishedCommentFields, slug } = options
  const fieldsWithNames = fields as FieldBase[]
  const missingFields = hasPublishedCommentFields.filter(fieldName => {
    return !fieldsWithNames.find(({ name }) => name === fieldName)
  })
  const isInvalidRequest = getIsInvalidRequest(
    body, slug, hasPublishedCommentFields, missingFields
  )

  if (isInvalidRequest) {
    return res.status(200).json({ hasPublishedComment: false })
  }

  const where = getWhere(body, hasPublishedCommentFields)
  const hasPublishedComment = await getHasPublishedComment(slug, where)

  return res.status(200).json(hasPublishedComment)
}

function getIsInvalidRequest(
  body: any,
  slug: string,
  hasPublishedCommentFields: string[],
  missingFields: string[]
) {
  return !!(
    !body ||
    typeof body !== 'object' ||
    !slug ||
    !hasPublishedCommentFields.length ||
    missingFields.length
  )
}

function getWhere(body: any, hasPublishedCommentFields: string[]) {
  const where: Where = {
    isApproved: {
      equals: true
    }
  }

  hasPublishedCommentFields.forEach(field => {
    const bodyFieldVal = body[field]
    if (bodyFieldVal) where[field] = { equals: bodyFieldVal }
  })

  return where
}

async function getHasPublishedComment(slug: string, where: Where) {
  const { docs } = await payload.find({
    collection: slug,
    limit: 1,
    where,
  })
  
  return docs?.length > 0
}
