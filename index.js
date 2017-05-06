const _ = require('lodash')
const kit = require('nokit')
const parse = require('csv-parse/lib/sync')


const results = {}

const questionOptions = {
  gender: [
    'male', 'female'
  ],
  price: [
    'below $150', '$150 - $200', '$201 - $250',
    '$251 - $300', 'over $350'
  ],
  date: [
    'less than 1 month', '1 - 6 months',
    '7 - 12 months', 'more than 12 months'
  ],
  distance: [
    'less than 15 minutes', '15 - 30 minutes',
    '46 - 60 minutes', 'more than 60 minutes'
  ]
}

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
  'How long do you spend on commuting to your class?': 'distance',
  'How much do you overall pay for your accommodation per week (including water, electricity and the Internet)?': 'price',
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
      items[index][key] = value.includes(';')
        ? value.split(';').map((item) => {
          return item.trim()
        })
        : value.trim()
    }
  })
})

const loopData = (callback, options = {}) => {
  let opts = _.assign({
    isLoopFactors: false,
    filter: (item) => {
      return _.isUndefined(item)
    }
  }, options)

  items.forEach((item, itemIndex) => {
    if (opts.filter(item, itemIndex)) return

    if (opts.isLoopFactors) {
      for (let factorIndex = 1; factorIndex <= 9; factorIndex++) {
        callback(item, itemIndex, factorIndex)
      }
    } else {
      callback(item, itemIndex)
    }
  })
}


//
// satisfied
//
const scoreA1 = _.sumBy(items, (item) => {
  return parseInt(item.satisfied, 10)
})
results.scoreOfSatisfied = _.round(scoreA1 / itemNum * 2, 2)

let maleNum = 0
const scoreA2 = _.sumBy(items, (item) => {
  if (item.gender === 'male') {
    maleNum++
    return parseInt(item.satisfied, 10)
  }
})
results.maleScoreOfSatisfied = _.round(scoreA2 / maleNum * 2, 2)

const scoreA3 = _.sumBy(items, (item) => {
  if (item.gender === 'female') {
    return parseInt(item.satisfied, 10)
  }
})
results.femaleScoreOfSatisfied = _.round(scoreA3 / (itemNum - maleNum) * 2, 2)


//
// ranking distribution
//
results.rankingDistribution = {}
loopData((item, itemIndex, factorIndex) => {
  if (itemIndex === 0) {
    results.rankingDistribution[`fs${factorIndex}`] = [0, 0, 0, 0]
    results.rankingDistribution[`fd${factorIndex}`] = [0, 0, 0, 0]
  }
  results.rankingDistribution[`fs${factorIndex}`][item[`fs${factorIndex}`] - 1]++
  results.rankingDistribution[`fd${factorIndex}`][item[`fd${factorIndex}`] - 1]++
}, {
  isLoopFactors: true
})


//
// relationship between price and satisfaction
//
const priceOfSatisfiedResults = [
  'priceOfSatisfiedA1', 'priceOfSatisfiedA2', 'priceOfSatisfiedA3',
  'priceOfSatisfiedA4', 'priceOfSatisfiedA5'
]

const initSatisfiedResults = (resulItems) => {
  resulItems.forEach((item) => {
    results[item] = {
      total: 0,
      itemNum: 0
    }
  })
}

const calSatisfied = (resulItems) => {
  resulItems.forEach((item) => {
    let result = results[item]
    result.score = _.round(result.total / result.itemNum * 2, 2)
  })
}

initSatisfiedResults(priceOfSatisfiedResults)

loopData((item, itemIndex) => {
  questionOptions.price.forEach((price, priceIndex) => {
    if (item.price === price) {
      let result = results[`priceOfSatisfiedA${priceIndex + 1}`]
      result.itemNum++
      result.total += parseInt(item.satisfied, 10)
    }
  })
})

calSatisfied(priceOfSatisfiedResults)


//
// relationship between distance and satisfaction
//
const distanceOfSatisfiedResults = [
  'distanceOfSatisfiedA1', 'distanceOfSatisfiedA2',
  'distanceOfSatisfiedA3', 'distanceOfSatisfiedA4'
]

initSatisfiedResults(distanceOfSatisfiedResults)

loopData((item, itemIndex) => {
  questionOptions.distance.forEach((distance, distanceIndex) => {
    if (item.distance === distance) {
      let result = results[`distanceOfSatisfiedA${distanceIndex + 1}`]
      result.itemNum++
      result.total += parseInt(item.satisfied, 10)
    }
  })
})

calSatisfied(distanceOfSatisfiedResults)


//
// factors of satisfaction or disatisfaction, and factors between genders
//
const analysisFormulas = ['fsA1', 'fdA1', 'fsA2', 'fdA2']

analysisFormulas.forEach((item) => {
  results[item] = {
    total: 0,
    factors: {}
  }
})

;[...questionOptions.date, ...questionOptions.gender].forEach((questionOption) => {
  analysisFormulas.forEach((item) => {
    results[`${item}-${_.snakeCase(questionOption)}`] = {
      total: 0,
      factors: {}
    }
  })
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
  let {factors} = result

  items.forEach((item) => {
    if (opts.filter(item)) return

    let total = 0

    for (let i = 1; i <= 9; i++) {
      let key = `${opts.key}${i}`
      let factorValue = opts.formula(item, key)

      total += factorValue
      if (_.isUndefined(factors[key])) {
        factors[key] = 0
      }
      factors[key] += factorValue
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

sumfactorvalue(results.fsA1, items)
sumfactorvalue(results.fsA2, items, {
  formula: formulaA2
})
// questionOptions.date.forEach((dateOption, index) => {
//   sumfactorvalue(results[`fsA${index + 3}`], items, {
//     filter: (item) => {
//       return item.date !== dateOption
//     }
//   })
// })
// questionOptions.gender.forEach((genderOption, index) => {
//   sumfactorvalue(results[`fdMaleA${index + 3}`], items, {
//     filter: (item) => {
//       return item.gender !== genderOption
//     }
//   })
// })
//
//
sumfactorvalue(results.fdA1, items, {
  key: 'fd'
})
sumfactorvalue(results.fdA2, items, {
  key: 'fd',
  formula: formulaA2
})
// questionOptions.length.forEach((lengthOption, index) => {
//   sumfactorvalue(results[`fdA${index + 3}`], items, {
//     key: 'fd',
//     filter: (item) => {
//       return item.length !== lengthOption
//     }
//   })
// })

console.log(results)
