// '?User[][]'.match(TYPE_REG)  -> ['?', 'User', '[][]']
const TYPE_REG = /^(\?)?(\w+)((?:\[\])*)$/

const getArrayNum = (str) => str.split('[]').length - 1
const parseArray = (typeName, arrayType) => {
  let node = { type: 'name', tok: typeName }

  if (arrayType) {
    const n = getArrayNum(arrayType)
    for (let i = 0; i < n; i++) {
      node = { type: 'array', tok: node }
    }
  }
  return node
}

const parseDef = (typeDef) => {
  const tokens = typeDef.match(TYPE_REG)
  if (tokens === null) { throw new Error('PARSE_DEF -- Unsupport type define', typeDef) }

  const [isOptional, typeName, arrayType] = tokens.slice(1, 4)
  const node = parseArray(typeName, arrayType)

  if (isOptional) {
    return { type: 'optional', tok: node }
  }
  return node
}

const parseUnion = (typeDef) => {
  const typeDefs = typeDef.split('|').map((str) => str.trim())
  if (typeDefs.length === 1) { return parseDef(typeDefs[0]) }
  else {
    return { type: 'union', elts: typeDefs.map(parseDef) }
  }
}

const parseInterface = (inter) => {
  const elts = {}
  for (let key in inter) {
    elts[key] = parseUnion(inter[key])
  }

  return { type: 'interface', elts }
}

const parseType = (typeDef) => {
  if (typeof typeDef === 'function') {
    return { type: 'validate', tok: typeDef }
  }

  if (typeof typeDef === 'object') {
    return parseInterface(typeDef)
  }

  throw new Error('PARSE_TYPE -- Unknown typeDef', typeDef)
}

module.exports = { parseType }
