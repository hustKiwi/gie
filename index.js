const kit = require('nokit')
const parse = require('csv-parse/lib/sync')

const data = kit.readFileSync('data.csv', 'utf8')

const items = parse(data, {columns: true})

kit.log(items)
