const { parseType } = require('./parser')

const customTypes = {}

const defineType = (typeName, extendTypeName, definition) => {
  if (definition === undefined) {
    if (typeof extendTypeName === 'function') {
      definition = extendTypeName
      extendTypeName = 'any'
    } else if (typeof extendTypeName === 'object') {
      definition = extendTypeName
      extendTypeName = 'object'
    } else {
      
      customTypes[typeName] 
    }
  }

  if (typeof extendTypeName !== 'string') {
    throw new Error('DEFINT_INTERFACE -- No valid extendType', typeName)
  }

  if (definition === undefined) {
    // define typeName as extendTypeName
    customTypes[typeName] = { type: 'name', tok: extendTypeName }
  } else {

    const type = parseType(definition)
    if (extendTypeName === 'any') { customTypes[typeName] = type }
    else {
      const extendType = { type: 'name', tok: extendTypeName }
      customTypes[typeName] = {
        type: 'extend',
        elts: [extendType, type],
      }
    }

  }

}

const check = (exp, node) => {
  switch (exp.type) {
    case 'name': {
      return check(customTypes[exp.tok], node)
    }
    case 'validate': {
      return exp.tok(node)
    }
    case 'extend': {
      return exp.elts.every((tok) => check(tok, node))
    }
    case 'interface': {
      const keys = Object.keys(exp.elts)
      return keys.every((key) => check(exp.elts[key], node[key]))
    }
    case 'union': {
      return exp.elts.some((tok) => check(tok, node))
    }
    case 'optional': {
      return node === undefined || check(exp.tok, node)
    }
    case 'array': {
      return Array.isArray(node) && node.every((n) => check(exp.tok, n))
    }
  }
}

const checkType = (typeName, node) => {
  const typeDefinition = customTypes[typeName]
  if (typeDefinition) { return check(typeDefinition, node) }

  throw new Error('CHECK_TYPE -- Unknown type', typeName)
}

// initialize base type
const BASE_TYPE = ['string', 'number', 'undefined', 'null', 'object', 'array']
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const getBaseType = (tok) => Object.prototype.toString.call(tok)
BASE_TYPE.forEach((bt) => {
  const typeString = `[object ${capitalize(bt)}]`
  customTypes[bt] = {
    type: 'validate',
    tok: (tok) => typeString === getBaseType(tok),
  }
})
customTypes['any'] = {
  type: 'validate',
  tok: () => true,
}

module.exports = { defineType, checkType }
