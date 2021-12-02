import { Client } from '@notionhq/client'
import { zeroPad } from './date-handler'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

export const getBlockedDays = async () => {
  const data = await notion.databases.query({
    database_id: process.env.BLOCKED_DB,
    page_size: 100,
    filter: {
      property: 'Date',
      date: {
        after: new Date(),
      },
    },
  })

  const blockedDays = data.results.map(
    (result) => result.properties.Date.date.start
  )
  return blockedDays
}

export const getCountEventsByDay = async (start, end) => {
  const data = await notion.databases.query({
    database_id: '44836420338642c7894766afd642b2eb',
    page_size: 100,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: start,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: end,
          },
        },
      ],
    },
  })
  const countings = data.results
    .map((result) => result.properties.Date.date.start)
    .map((date) => date.split('T')[0])
    .reduce((prev, curr) => {
      if (!prev[curr]) {
        prev[curr] = 0
      }
      prev[curr]++
      return prev
    }, {})

  return countings
}

export const getAvailableHours = async (date) => {
  const data = await notion.databases.query({
    database_id: '44836420338642c7894766afd642b2eb',
    page_size: 100,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: date,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: date,
          },
        },
      ],
    },
  })

  const startHour1 = 8
  const endHour1 = 12

  const startHour2 = 14
  const endHour2 = 17

  const hours = []

  for (let i = startHour1; i < endHour1; i++) {
    hours.push({
      hour: zeroPad(i) + ':00:00',
      available: true,
    })
  }
  for (let i = startHour2; i < endHour2; i++) {
    hours.push({
      hour: zeroPad(i) + ':00:00',
      available: true,
    })
  }

  const blockedHours = data.results
    .map((result) => result.properties.Date.date.start)
    .map((date) => date.split('T')[1])
    .map((date) => date.split('.')[0])
    .sort()

  const availableHours = hours.map((hour) => {
    return {
      ...hour,
      available: blockedHours.indexOf(hour.hour) < 0,
    }
  })

  return availableHours
}

const getNotionRecord = ({ date, name, phone, observacoes }) => {
  return {
    Confirmado: { id: 'lilX', type: 'checkbox', checkbox: false },
    Paciente: {
      id: '%3ARp~',
      type: 'rich_text',
      rich_text: [{ text: { content: name } }],
    },
    

    Date: {
      id: '~x%7BQ',
      type: 'date',
      date: { start: date, end: null },
    },

    Name: {
      id: 'title',
      type: 'title',
      title: [{ text: { content: name } }],
    },

    Telefone: {
      id: 'wAPp',
      type: 'phone_number',
      phone_number: phone,
    },

    Observacoes: {
      id: 'D%7B%5B%7C',
      type: 'rich_text',
      rich_text: [{ text: { content: observacoes } }],
    },
  }
}

export const insertSchedule = async ({ date, name, phone, observacoes }) => {
  const registro = getNotionRecord({ date, name, phone, observacoes })
  const inserted = await notion.pages.create({
    parent: {
      database_id: '44836420338642c7894766afd642b2eb',
    },
    properties: registro,
  })
  return inserted
}
