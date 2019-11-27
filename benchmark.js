const { checkType } = require('./checkType')
const { TEACHER_CASES } = require('./cases')

const CASE_NUM = 1000000

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

// Benchmark
const randomInt = (min, max) => Number.parseInt(Math.random() * (max - min) + min)
const generateCase = () => TEACHER_CASES[randomInt(0, 4)]
const benchmark = (check) => {
  const start = new Date()
  const len = TEACHER_CASES.length
  for (let i = 0; i < CASE_NUM; i++) {
    // const teacher = generateCase()
    const teacher = TEACHER_CASES[i % len]
    check('Teacher', teacher)
  }
  const during = new Date() - start
  console.log(`Spends ${during} ms for ${CASE_NUM} cases.`)
}

const main = () => {
  // main
  console.log('Manul check:')
  benchmark(checkTeacher)
  console.log('CheckType:')
  benchmark(checkType)
}

main()
