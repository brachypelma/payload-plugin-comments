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

function setIsApprovedField(options: CommentOptions) {
  const fields = options.fields as FieldBase[]
  const isApprovedFieldBase = fields.find(({ name }) => name === 'isApproved')
  const hasIsApprovedField = !!isApprovedFieldBase
  const isApprovedField = hasIsApprovedField ? isApprovedFieldBase as Field : null
  
  if (!hasIsApprovedField) {
    options.fields.push({
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
    })
  } else if (isApprovedField) {
    isApprovedField.type = 'checkbox'
  }
}
