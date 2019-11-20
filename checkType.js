const noop = () => true
const getBaseType = (tok) => Object.prototype.toString.call(tok).slice(8, -1).toLocaleLowerCase()

const customTypes = {}

const defineType = (typeName, extendType, definition) => {
  
  if (definition === undefined) {
    if (typeof extendType === 'function') {
      definition = extendType
      extendType = 'any'
    } else if (typeof extendType === 'object') {
      definition = extendType
      extendType = 'object'
    } else {
      definition = noop
    }
  }

  if (typeof extendType !== 'string') {
    throw new Error('DEFINT_INTERFACE -- No valid extendType', typeName)
  }

  if (typeof definition !== 'function' && typeof definition !== 'object') { 
    throw new Error('DEFINT_INTERFACE -- No valid definition', typeName)
  }

  customTypes[typeName] = {
    extendType,
    definition,
  }
}

// '?User[]'.match(TYPE_REG)  -> ['?', 'User', '[]']
const TYPE_REG = /^(\?)?(\w*)(\[\])?$/

const checkDef = (typeDef, node) => {

  const check = (type, node) => {
    // TODO check match result, maybe need throw error in here
    const [isOptional, typeName, isArrayType] = type.match(TYPE_REG).slice(1, 4)

    if (isOptional && node === undefined) { return true }

    if (isArrayType) {
      if (Array.isArray(node)) {
        return node.every((item) => checkType(typeName, item))
      }
      return false
    }

    return checkType(typeName, node)
  }
  
  const types = typeDef.split('|').map((str) => str.trim())
  return types.some((type) => check(type, node))
}

const checkDefinition = (definition, node) => {
  if (typeof definition === 'function') { return definition(node) }

  const keys = Object.keys(definition)
  return keys.every((key) => checkDef(definition[key], node[key]))
}

const checkType = (typeName, node) => {
  if (typeName === 'any') { return true }

  const typeDefinition = customTypes[typeName]
  if (typeDefinition) {
    const { extendType, definition } = typeDefinition
    return checkType(extendType, node) && checkDefinition(definition, node)
  }

  throw new Error('CHECK_TYPE -- Unknown type', typeName)
}

// initialize base type
const BASE_TYPE = ['string', 'number', 'undefined', 'null', 'object', 'array']
BASE_TYPE.forEach((bt) => defineType(bt, (tok) => bt === getBaseType(tok)))

// module.exports = { defineType, checkType }
