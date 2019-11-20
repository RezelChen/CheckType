const noop = () => true
const getBaseType = (tok) => Object.prototype.toString.call(tok).slice(8, -1).toLocaleLowerCase()

// '?User[]'.match(TYPE_REG)  -> ['?', 'User', '[]']
const TYPE_REG = /^(\?)?(\w*)(\[\])?$/
const analizeDef = (typeDef) => {
  // TODO check match result, maybe need throw error in here
  const [isOptional, typeName, isArrayType] = typeDef.match(TYPE_REG).slice(1, 4)

  return (node) => {
    if (isOptional && node === undefined) { return true }

    if (isArrayType) {
      if (Array.isArray(node)) {
        return node.every((item) => checkType(typeName, item))
      }
      return false
    }

    return checkType(typeName, node)
  }
}

const analizeUnion = (typeDef) => {
  const types = typeDef.split('|').map((str) => str.trim())
  const typeDefs = types.map((type) => analizeDef(type))
  
  return (node) => typeDefs.some((def) => def(node))
}

const analize = (definition) => {
  const keys = Object.keys(definition)
  const defs = {}
  keys.forEach((key) => defs[key] = analizeUnion(definition[key]))
  return (node) => keys.every((key) => defs[key](node[key]))
}

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

  if (typeof definition === 'object') {
    definition = analize(definition)
  }

  if (typeof extendType !== 'string') {
    throw new Error('DEFINT_INTERFACE -- No valid extendType', typeName)
  }

  if (typeof definition !== 'function') {
    throw new Error('DEFINT_INTERFACE -- No valid definition', typeName)
  }

  customTypes[typeName] = {
    extendType,
    definition,
  }
}

const checkType = (typeName, node) => {
  if (typeName === 'any') { return true }

  const typeDefinition = customTypes[typeName]
  if (typeDefinition) {
    const { extendType, definition } = typeDefinition
    return checkType(extendType, node) && definition(node)
  }

  throw new Error('CHECK_TYPE -- Unknown type', typeName)
}

// initialize base type
const BASE_TYPE = ['string', 'number', 'undefined', 'null', 'object', 'array']
BASE_TYPE.forEach((bt) => defineType(bt, (tok) => bt === getBaseType(tok)))

// module.exports = { defineType, checkType }
