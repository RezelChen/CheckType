const noop = () => true
const customTypes = {}

// '?User[]'.match(TYPE_REG)  -> ['?', 'User', '[]']
const TYPE_REG = /^(\?)?(\w*)(\[\])?$/

const analizeName = (name) => {
  if (customTypes[name]) { return customTypes[name] }
  else { return (node) => customTypes[name](node) }
}

const anlaizeOptional = (isOptional, type) => {
  if (!isOptional) { return type }
  else { return (node) => node === undefined || type(node) }
}

const anlaizeArray = (isArrayType, type) => {
  if (!isArrayType) { return type }
  else { return (node) => Array.isArray(node) && node.every(type) }
}

const analizeDef = (typeDef) => {
  // TODO check match result, maybe need throw error in here
  const [isOptional, typeName, isArrayType] = typeDef.match(TYPE_REG).slice(1, 4)
  let type = analizeName(typeName)

  type = anlaizeOptional(isOptional, type)
  type = anlaizeArray(isArrayType, type)

  return type
}

const analizeUnion = (typeDef) => {
  const typeDefs = typeDef.split('|').map((str) => str.trim())
  const types = typeDefs.map(analizeDef)
  if (types.length === 0) { return noop }
  if (types.length === 1) { return types[0] }
  else {
    return (node) => types.some((type) => type(node))
  }
}

const analizeInterface = (inter) => {
  const keys = Object.keys(inter)
  const types = {}
  keys.forEach((key) => types[key] = analizeUnion(inter[key]))
  return (node) => keys.every((key) => types[key](node[key]))
}

const analizeExtend = (extendTypeName, type) => {
  if (extendTypeName === 'any') { return type }
  else {
    const extendType = analizeName(extendTypeName)
    return (node) => extendType(node) && type(node)
  }
}

const analize = (extendTypeName, typeDef) => {
  const type = (typeof typeDef === 'function') ? typeDef : analizeInterface(typeDef)
  return analizeExtend(extendTypeName, type)
}

const defineType = (typeName, extendTypeName, definition) => {

  if (definition === undefined) {
    if (typeof extendTypeName === 'function') {
      definition = extendTypeName
      extendTypeName = 'any'
    } else if (typeof extendTypeName === 'object') {
      definition = extendTypeName
      extendTypeName = 'object'
    } else {
      definition = noop
    }
  }

  if (typeof extendTypeName !== 'string') {
    throw new Error('DEFINT_INTERFACE -- No valid extendType', typeName)
  }

  const type = analize(extendTypeName, definition)

  if (typeof type !== 'function') {
    throw new Error('DEFINT_INTERFACE -- No valid definition', typeName)
  }

  customTypes[typeName] = type
}

const checkType = (typeName, node) => {
  const typeDefinition = customTypes[typeName]
  if (typeDefinition) { return typeDefinition(node) }

  throw new Error('CHECK_TYPE -- Unknown type', typeName)
}

// initialize base type
const BASE_TYPE = ['string', 'number', 'undefined', 'null', 'object', 'array']
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const getBaseType = (tok) => Object.prototype.toString.call(tok)
BASE_TYPE.forEach((bt) => {
  const typeString = `[object ${capitalize(bt)}]`
  customTypes[bt] = (tok) => typeString === getBaseType(tok)
})


// module.exports = { defineType, checkType }
