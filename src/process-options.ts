import { Config } from 'payload/config'
import { CommentOptions, IncomingOptions } from './types'
import { defaultOptions } from '.'
import { Field, FieldBase } from 'payload/dist/fields/config/types'

export default function getProcessedOptions(
  incomingOptions: IncomingOptions,
  incomingConfig: Config,
): CommentOptions {
  const options = assignOptions(incomingOptions, incomingConfig)

  // Make sure we have a properly-formatted `isApproved` field
  setIsApprovedField(options)

  // Make sure we hae a properly-formatted `replyPost` field
  setReplyPostField(options)

  return options
}

function assignOptions(
  incomingOptions: IncomingOptions,
  incomingConfig: Config,
): CommentOptions {
  const options = Object.assign({ ...defaultOptions }, incomingOptions)
  const { serverURL, routes } = incomingConfig

  if (options.sendAlert && !options.alertEditUrlBase && serverURL) {
    const adminDir = routes?.admin ?? 'admin'
    options.alertEditUrlBase = serverURL + adminDir
  }

  return options
}

function getRequiredFieldData(options: CommentOptions, fieldName: string) {
  const fields = options.fields as FieldBase[]
  const fieldBase = fields.find(({ name }) => name === fieldName)
  const hasField = !!fieldBase
  const reqField = hasField ? fieldBase as Field : null

  return { hasField, reqField }
}

function setIsApprovedField(options: CommentOptions) {
  const { hasField, reqField } = getRequiredFieldData(options, 'isApproved')
  
  if (!hasField) {
    options.fields.push({
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
    })
  } else if (reqField) {
    reqField.type = 'checkbox'
  }
}

function setReplyPostField(options: CommentOptions) {
  const { hasField, reqField } = getRequiredFieldData(options, 'replyPost')
  
  if (!hasField) {
    options.fields.push({
      name: 'replyPost',
      type: 'relationship',
      relationTo: 'posts',
    })
  } else if (reqField) {
    reqField.type = 'relationship'
  }
}
