const { checkType } = require('./checkType')
const { TEACHER_CASES, OPT_ARRAY_CASES } = require('./cases')

const main = () => {
  console.log('test case:')
  console.log('Teacher cases:\n', TEACHER_CASES.map((c) => checkType('Teacher', c)))
  console.log('OptArray cases:\n', OPT_ARRAY_CASES.map((c) => checkType('OptArray', c)))
}

main()
