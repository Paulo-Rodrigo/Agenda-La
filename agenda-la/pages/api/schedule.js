import { insertSchedule } from '../../lib/notion'

export default async function (req, res) {
  const { day, hour, name, phone, observacoes } = req.body
  if (req.method !== 'POST') {
    return res.send({ error: true })
  }

  const inserted = await insertSchedule({
    date: day + 'T' + hour + '.000-03:00',
    name,
    phone,
    observacoes
  })

  res.send({
    hour,
    day,
  })
}
