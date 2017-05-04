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
  'Factors of satisfaction (private space)?': 'f4',
  'Factors of satisfaction (good facilities and furniture)?': 'f5',
  'Factors of satisfaction (good relationship with flatmates or homestay hosts)?': 'f6',
  'Factors of satisfaction (similar lifestyle)?': 'f7',
  'Factors of satisfaction (accommodation is tidy)?': 'f8',
  'Factors of satisfaction (short distance to the school)?': 'f9',
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

// preproccess the data
_.slice(parse(
  kit.readFileSync('data.csv', 'utf8'), {columns: true}
), 0, 10).forEach((item, index) => {
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

kit.log(items)
