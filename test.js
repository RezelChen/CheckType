// use case

// properties: typeName, extendType, typeDefinition
defineType('Email', 'string', (str) => str.includes('@'))   // support define function to check type

defineType('User', {
  id: 'string',
  mail: '?Email',   // support optional properties
})

// support define interface
defineType('Child', {
  name: 'string',
})

// support define interface with extends ('User' type in this case)
defineType('Teacher', 'User', {
  students: 'User[] | Child[]',   // support define array type && union type
})

const teacher1 = { 
  id: '123', 
  mail: '123@xmind.net', 
  students: [{ name: 'Tom' }]
}

const teacher2 = {
  id: '456',
  students: [{ id: '123', mail: '123@xmind.net' }],
}

const fakeTeacher1 = {
  id: '456',
  mail: '456#xmind.net',  // wrong email
  students: [{ id: '123', mail: '123@xmind.net' }],
}

const fakeTeacher2 = {
  id: 'abc',
  mail: '123@xmin.net',
  students: [{ mail: '123@xmind.net' }],
}

const res = [teacher1, teacher2, fakeTeacher1, fakeTeacher2].map((t)=> checkType('Teacher', t))
console.log(res)
