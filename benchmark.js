const CASE_NUM = 100000

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

const generateCase = () => {
  return {
    id: '456',
    mail: '456#xmind.net',  // wrong email
    students: [{ id: '123', mail: '123@xmind.net' }],
  }
}

const benchmark = () => {
  const start = new Date()

  for (let i = 0; i < CASE_NUM; i++) {
    const teacher = generateCase()
    checkType('Teacher', teacher)
  }

  const during = new Date() - start
  console.log(`Spends ${during} ms for ${CASE_NUM} cases.`)
}

benchmark()