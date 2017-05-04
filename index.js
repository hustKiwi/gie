const _ = require('lodash')
const kit = require('nokit')
const parse = require('csv-parse/lib/sync')


const titleMap = {
  'Questionnaire ID': 'id',
  'Gender?': 'gender',
  'Age?': 'age',
  'Nationality?': 'nationality',
  'How long have you been in Auckland?': 'length',
  'What is the education level that you are / will be study for?': 'education',
  'Do you live in the city?': 'city',
  'Which kind of accommodation are you living in?': 'kind',
  'How satisfied are you with your accommodation?': 'satisfied',
  'Where did you get the information of your accommodation?': 'infor',
  'How long do you spend on commuting to your class?': 'commuting',
  'How much do you overall pay for your accommodation per week (including water, electricity and the Internet)?': 'payment',
  'Factors of satisfaction (convenient location)?': 'fs1',
  'Factors of satisfaction (security)?': 'fs2',
  'Factors of satisfaction (rental cost)?': 'fs3',
  'Factors of satisfaction (private space)?': 'fs4',
  'Factors of satisfaction (good facilities and furniture)?': 'fs5',
  'Factors of satisfaction (good relationship with flatmates or homestay hosts)?': 'fs6',
  'Factors of satisfaction (similar lifestyle)?': 'fs7',
  'Factors of satisfaction (accommodation is tidy)?': 'fs8',
  'Factors of satisfaction (short distance to the school)?': 'fs9',
  'Factors of dissatisfaction (inconvenient location)?': 'fd1',
  'Factors of dissatisfaction (lack of security)?': 'fd2',
  'Factors of dissatisfaction (high rental cost)?': 'fd3',
  'Factors of dissatisfaction (disturbed by others)?': 'fd4',
  'Factors of dissatisfaction (lack of facilities or furniture)?': 'fd5',
  'Factors of dissatisfaction (bad relationship with flatmates or homestay hosts)?': 'fd6',
  'Factors of dissatisfaction (different lifestyle)?': 'fd7',
  'Factors of dissatisfaction (accommodation is untidy)?': 'fd8',
  'Factors of dissatisfaction (long distance to the school)?': 'fd9',
  'Have you changed your accommodation in the last 12 months?': 'changed',
  'What are the most important factors which make you change your accommodation? (multiple choice)': 'factorsOfChanged',
  'Do you like to live with flatmates from the same or different cultural background?': 'culturalBackground'
}

const items = []
const itemNum = 100
// const itemNum = 1

// preproccess the data
_.slice(parse(
  kit.readFileSync('data.csv', 'utf8'), {columns: true}
), 0, itemNum).forEach((item, index) => {
  items.push({})
  _.forEach(item, (value, key) => {
    key = titleMap[key.trim()]
    if (key) {
      items[index][key] = value.includes(';') ?
        value.split(';').map((item) => {
          return item.trim()
        })
        : value.trim()
    }
  })
})

const results = {}

;[
  'fsA1', 'fsA2', 'fsA3', 'fsA4', 'fsA5', 'fsA6',
  'fdA1', 'fdA2', 'fdA3', 'fdA4', 'fdA5', 'fdA6'
].forEach((item) => {
  results[item] = {
    total: 0
  }
})

const sumfactorvalue = (result, items, options = {}) => {
  let opts = _.assign({
    key: 'fs',
    formula: (item, key) => {
      return item[key] - 1
    },
    filter: (item) => {
      return _.isUndefined(item)
    }
  }, options)

  items.forEach((item) => {
    if (opts.filter(item)) return

    let total = 0

    for (let i = 1; i <=9; i++) {
      let key = `${opts.key}${i}`
      let factorValue = opts.formula(item, key)

      total += factorValue
      if (_.isUndefined(result[key])) {
        result[key] = 0
      }
      result[key] += factorValue
    }

    result.total += total
  })
}

const formulaA2 = (item, key) => {
  let value = item[key] - 1
  if (value > 0) {
    value = value = 2 * value - 1
  }
  return value
}


//
// factors of satisfaction
//
sumfactorvalue(results.fsA1, items)
sumfactorvalue(results.fsA2, items, {
  formula: formulaA2
})

;[
  'less than 1 month', '1 - 6 months',
  '7 - 12 months', 'more than 12 months'
].forEach((lengthsOption, index) => {
  sumfactorvalue(results[`fsA${index + 3}`], items, {
    filter: (item) => {
      return item.length !== lengthsOption
    }
  })
})


//
// factors of disatisfaction
//
sumfactorvalue(results.fdA1, items, {
  key: 'fd'
})
sumfactorvalue(results.fdA2, items, {
  key: 'fd',
  formula: formulaA2
})

;[
  'less than 1 month', '1 - 6 months',
  '7 - 12 months', 'more than 12 months'
].forEach((lengthsOption, index) => {
  sumfactorvalue(results[`fdA${index + 3}`], items, {
    key: 'fd',
    filter: (item) => {
      return item.length !== lengthsOption
    }
  })
})

console.log(results)
