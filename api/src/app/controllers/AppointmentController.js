import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format } from 'date-fns'
import pt from 'date-fns/locale/pt'

import User from '../models/User'
import File from '../models/File'
import Appointment from '../models/Appointment'
import Notification from '../schemas/Notification'

class AppointmentController {
  async index (req, res) {
    const { page = 1 } = req.query
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    })

    return res.json({ appointments })
  }

  async store (req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    if (!(await schema.isValid(req.body))) return res.status(400).json({ error: 'Validation fails' })

    const { provider_id: providerId, date } = req.body
    const isProvider = await User.findOne({
      where: { id: providerId, provider: true }
    })

    if (!isProvider) return res.status(401).json({ error: 'You can only create appointment with providers' })

    const hourStart = startOfHour(parseISO(date))
    console.log(hourStart)
    if (isBefore(hourStart, new Date())) return res.status(400).json({ error: 'Past dates are not permitted' })

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id: providerId,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkAvailability) return res.status(400).json({ error: 'Appointment date is not available' })

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id: providerId,
      date
    })

    const user = await User.findByPk(req.userId)
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', ás' H:mm'h'",
      { locale: pt }
    )
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: providerId
    })

    return res.json(appointment)
  }
}

export default new AppointmentController()
