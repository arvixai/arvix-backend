import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '20mb' }))
app.use(cors())
app.use(express.static('.'))

app.post('/chat', async (req, res) => {
    const { message, image } = req.body

    if (!message && !image) {
        return res.status(400).json({ error: 'Mensagem ou imagem obrigatória.' })
    }

    try {
        const content = []

        if (message) {
            content.push({ type: 'text', text: message })
        }

        if (image) {
            content.push({ type: 'image_url', image_url: { url: image } })
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é ARVIX IA, criada por Isabelle Pereira. Responda sempre em português. Você conversa e analisa imagens.'
                    },
                    {
                        role: 'user',
                        content: content
                    }
                ]
            })
        })

        const data = await response.json()

        console.log('Resposta OpenRouter:', JSON.stringify(data))

        if (data.error) {
            console.error('Erro OpenRouter:', data.error)
            return res.status(500).json({ error: data.error.message })
        }

        if (!data.choices || data.choices.length === 0) {
            console.error('Sem choices:', JSON.stringify(data))
            return res.status(500).json({ error: 'Resposta inválida da IA.' })
        }

        const reply = data.choices[0].message.content
        res.json({ reply })

    } catch (error) {
        console.error('ERRO:', error)
        res.status(500).json({ error: 'Erro ao processar sua mensagem.' })
    }
})

app.listen(PORT, () => {
    console.log(`ARVIX rodando em http://localhost:${PORT}`)
})
