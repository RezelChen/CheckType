const CASE_NUM = 1000000

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

// manual check for benchmark
const isString = (tok) => Object.prototype.toString.call(tok) === '[object String]'
const checkTeacher = (teacher) => {
  if (!isString(teacher.id)) { return false }
  if (!(teacher.mail === undefined || (isString(teacher.mail) && teacher.mail.includes('@')) )) { return false }
  return teacher.students.every((student) => {
    if (!(isString(student.id))) { return isString(student.name) }
    if (!(student.mail === undefined || (isString(student.mail) && student.mail.includes('@')) )) { return isString(student.name) }
    return true
  })
}

// TEST CASE
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

const TEST_CASES = [teacher1, fakeTeacher1, teacher2, fakeTeacher2]

// Benchmark
const randomInt = (min, max) => Number.parseInt(Math.random() * (max - min) + min)
const generateCase = () => TEST_CASES[randomInt(0, 4)]
const benchmark = (check) => {
  const start = new Date()
  const len = TEST_CASES.length
  for (let i = 0; i < CASE_NUM; i++) {
    // const teacher = generateCase()
    const teacher = TEST_CASES[i % len]
    check('Teacher', teacher)
  }
  const during = new Date() - start
  console.log(`Spends ${during} ms for ${CASE_NUM} cases.`)
}

// main
console.log('test case:')
console.log(TEST_CASES.map(checkTeacher))
console.log('Manul check:')
benchmark(checkTeacher)
console.log('CheckType:')
benchmark(checkType)
